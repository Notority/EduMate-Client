import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { WelcomeBanner } from '../src/components/WelcomeBanner';
import { useStore } from '../src/store/useStore';
import { VerificationStatusCard } from '../src/components/VerificationStatusCard';
import { TeacherStatsRow } from '../src/components/TeacherStatsRow';
import { TeacherQuickActions } from '../src/components/TeacherQuickActions';
import { TeacherProfilePreview } from '../src/components/TeacherProfilePreview';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;
type TeacherProfileData = {
  subjects?: string;
  experienceYears?: number;
  education?: string;
  certifications?: string;
  hourlyRate?: number;
  availability?: string;
  totalStudents: number;
  totalCourses: number;
  totalReviews: number;
  averageRating?: number;
};

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const getTeacherVerification = useStore((s) => s.getTeacherVerification);
  const getTeacherProfile = useStore((s) => s.getTeacherProfile);

  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<{ status: VerificationStatus; documentUrl?: string; notes?: string } | null>(null);
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vData, pData] = await Promise.all([getTeacherVerification(), getTeacherProfile()]);
      setVerification(vData);
      setProfile(pData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { logout(); router.replace('/login'); };
  const handleProfile = () => router.push('/teacher-profile');
  const handleVerification = () => router.push('/teacher-verification');
  const handleMyCourses = () => router.push('/teacher-courses');
  const handlePrivateCourses = () => router.push('/teacher-private-courses');
  const handleEarnings = () => router.push('/teacher-earnings');

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={handleProfile} />
        <View style={{ padding: 16, gap: 12 }}>
          <WelcomeBanner userName={`${user.firstName} ${user.lastName}`} xpPoints={user.xpPoints} level={user.level} />
          {profile && <TeacherStatsRow
            totalStudents={profile.totalStudents}
            totalCourses={profile.totalCourses}
            averageRating={profile.averageRating}
          />}
          <VerificationStatusCard
            loading={loading}
            verification={verification}
            onGoToVerification={handleVerification}
          />
          {profile && <TeacherQuickActions
            onEditProfile={handleProfile}
            onMyCourses={handleMyCourses}
            onPrivateCourses={handlePrivateCourses}
            onEarnings={handleEarnings}
          />}
          {profile && (profile.subjects || profile.education) && (
            <TeacherProfilePreview
              subjects={profile.subjects}
              experienceYears={profile.experienceYears}
              education={profile.education}
            />
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
