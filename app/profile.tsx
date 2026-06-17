import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PhoneFrame } from '../src/layout/PhoneFrame';
import { Input } from '../src/ui/Input';
import { Button } from '../src/ui/Button';
import { useStore } from '../src/store/useStore';
import { colors } from '../src/constants/theme';

const AVATAR_OPTIONS = ['🦊', '🦉', '🦁', '🐼', '🦄', '🐙', '👽', '🤖', '🐱', '🐶', '🐯', '🐻'];

export default function ProfileScreen() {
  const r = useRouter();
  const user = useStore((s) => s.user);
  const updateProfile = useStore((s) => s.updateProfile);
  const changePassword = useStore((s) => s.changePassword);
  const getActivities = useStore((s) => s.getActivities);
  const deleteAccount = useStore((s) => s.deleteAccount);

  // Profile Form State
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [email, setEmail] = useState(user.email || '');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '👤');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [activities, setActivities] = useState<any[]>([]);
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  // Fetch Activities on Load
  const loadActivities = async () => {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (err) {
      console.log('Failed to load activities', err);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setInfoError('First and last name cannot be empty.');
      setInfoSuccess('');
      return;
    }
    if (!email.includes('@')) {
      setInfoError('Please enter a valid email.');
      setInfoSuccess('');
      return;
    }
    setInfoError('');
    setInfoSuccess('');
    setLoadingInfo(true);
    try {
      await updateProfile(firstName, lastName, email, profilePicture);
      setInfoSuccess('Profile updated successfully.');
      loadActivities(); // reload logs
    } catch (err: any) {
      setInfoError(err.message || 'Failed to update profile.');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      setPwdError('Current password is required.');
      setPwdSuccess('');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      setPwdSuccess('');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      setPwdSuccess('');
      return;
    }
    setPwdError('');
    setPwdSuccess('');
    setLoadingPwd(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPwdSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadActivities(); // reload logs
    } catch (err: any) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setLoadingPwd(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
              r.replace('/login');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <PhoneFrame>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => r.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={{ color: colors.white, fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Profile Avatar Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose Avatar</Text>
          <View style={styles.avatarDisplayWrapper}>
            <Text style={styles.currentAvatarText}>{profilePicture}</Text>
          </View>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.avatarGridItem,
                  profilePicture === item && styles.avatarGridItemActive,
                ]}
                onPress={() => setProfilePicture(item)}
              >
                <Text style={{ fontSize: 24 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personal Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Details</Text>
          {infoError ? <Text style={styles.errorText}>{infoError}</Text> : null}
          {infoSuccess ? <Text style={styles.successText}>{infoSuccess}</Text> : null}
          
          <Input label="First Name" value={firstName} onChangeText={setFirstName} placeholder="First Name" />
          <Input label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Last Name" />
          <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" />
          
          <Button
            title={loadingInfo ? 'Saving changes...' : 'Save Profile Details'}
            onPress={handleUpdateProfile}
            disabled={loadingInfo}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Change Password Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          {pwdError ? <Text style={styles.errorText}>{pwdError}</Text> : null}
          {pwdSuccess ? <Text style={styles.successText}>{pwdSuccess}</Text> : null}

          <Input label="Current Password" value={oldPassword} onChangeText={setOldPassword} placeholder="••••••••" secureTextEntry />
          <Input label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="•••••••• (6+ chars)" secureTextEntry />
          <Input label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" secureTextEntry />

          <Button
            title={loadingPwd ? 'Updating...' : 'Update Password'}
            onPress={handleChangePassword}
            disabled={loadingPwd}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Account Activity Timeline Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Activity</Text>
          {activities.length > 0 ? (
            <View style={styles.timeline}>
              {activities.map((act) => {
                const date = new Date(act.timestamp);
                const formattedDate = date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <View key={act.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineDesc}>{act.description}</Text>
                      <Text style={styles.timelineTime}>{formattedDate}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyActivityText}>No recent activity logged.</Text>
          )}
        </View>

        {/* Danger Zone Card */}
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={[styles.cardTitle, { color: '#fca5a5' }]}>Danger Zone</Text>
          <Text style={styles.dangerDesc}>
            Deleting your account will permanently remove all your data. This action is irreversible.
          </Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteBtnText}>Delete Account Permanently</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(23, 17, 34, 0.8)',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(25, 20, 45, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorText: {
    backgroundColor: 'rgba(127,29,29,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    color: '#fca5a5',
    fontSize: 12,
    padding: 8,
    borderRadius: 12,
    textAlign: 'center',
  },
  successText: {
    backgroundColor: 'rgba(6,78,59,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    color: colors.emerald,
    fontSize: 12,
    padding: 8,
    borderRadius: 12,
    textAlign: 'center',
  },
  avatarDisplayWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 8,
  },
  currentAvatarText: {
    fontSize: 40,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 4,
  },
  avatarGridItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGridItemActive: {
    backgroundColor: 'rgba(115,46,228,0.25)',
    borderColor: colors.primary,
  },
  timeline: {
    gap: 12,
    paddingLeft: 4,
    marginVertical: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDesc: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  timelineTime: {
    color: colors.surfaceVariant,
    fontSize: 9,
    marginTop: 2,
  },
  emptyActivityText: {
    color: colors.surfaceVariant,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  dangerCard: {
    borderColor: 'rgba(239,68,68,0.2)',
  },
  dangerDesc: {
    color: colors.surfaceVariant,
    fontSize: 11,
    lineHeight: 16,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#fca5a5',
    fontWeight: '700',
    fontSize: 12,
  },
});
