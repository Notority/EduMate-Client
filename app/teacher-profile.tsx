import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { DashboardHeader } from '../src/components/DashboardHeader';
import { GlassCard } from '../src/components/GlassCard';
import { Input } from '../src/ui/Input';
import { Button } from '../src/ui/Button';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';

export default function TeacherProfileScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const getTeacherProfile = useStore((s) => s.getTeacherProfile);
  const updateTeacherProfile = useStore((s) => s.updateTeacherProfile);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [subjects, setSubjects] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [certifications, setCertifications] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [availability, setAvailability] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getTeacherProfile();
      setSubjects(data.subjects || '');
      setExperienceYears(data.experienceYears?.toString() || '');
      setEducation(data.education || '');
      setCertifications(data.certifications || '');
      setHourlyRate(data.hourlyRate?.toString() || '');
      setAvailability(data.availability || '');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTeacherProfile({
        firstName,
        lastName,
        email,
        phone,
        subjects,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        education,
        certifications,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        availability
      });
      Alert.alert('Success', 'Profile updated!');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <ScrollView style={{ flex: 1, backgroundColor: '#0d0714' }}>
        <DashboardHeader onLogout={handleLogout} onProfile={() => {}} />
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '800', 
            color: colors.white,
            marginBottom: 8
          }}>
            Edit Teacher Profile
          </Text>

          {loading ? (
            <GlassCard style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </GlassCard>
          ) : (
            <>
              <GlassCard style={{ padding: 16, gap: 12 }}>
                <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
                  Personal Information
                </Text>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                />
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  keyboardType="email-address"
                />
                <Input
                  label="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />
              </GlassCard>

              <GlassCard style={{ padding: 16, gap: 12 }}>
                <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>
                  Professional Information
                </Text>
                <Input
                  label="Subjects"
                  value={subjects}
                  onChangeText={setSubjects}
                  placeholder="Math, Physics, etc."
                />
                <Input
                  label="Experience (years)"
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  placeholder="5"
                  keyboardType="numeric"
                />
                <Input
                  label="Education"
                  value={education}
                  onChangeText={setEducation}
                  placeholder="Bachelor's Degree in..."
                />
                <Input
                  label="Certifications"
                  value={certifications}
                  onChangeText={setCertifications}
                  placeholder="Certifications separated by commas"
                />
                <Input
                  label="Hourly Rate ($)"
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  placeholder="25"
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Availability"
                  value={availability}
                  onChangeText={setAvailability}
                  placeholder="Weekdays 6-9 PM"
                />
              </GlassCard>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button title="Cancel" variant="primary" onPress={() => router.back()} style={{ flex: 1 }} />
                <Button title={saving ? "Saving..." : "Save"} onPress={handleSave} disabled={saving} style={{ flex: 1 }} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}
