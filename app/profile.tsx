import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { PhoneFrame } from "../src/layout/PhoneFrame";
import { useStore } from "../src/store/useStore";
import { colors } from "../src/constants/theme";
import { profileStyles as styles } from "../src/features/profile/profileStyles";
import { ProfileAvatarCard } from "../src/features/profile/ProfileAvatarCard";
import { ProfileDetailsCard } from "../src/features/profile/ProfileDetailsCard";
import { ProfilePasswordCard } from "../src/features/profile/ProfilePasswordCard";
import { ProfileActivityCard } from "../src/features/profile/ProfileActivityCard";
import { ProfileDangerCard } from "../src/features/profile/ProfileDangerCard";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const updateProfile = useStore((state) => state.updateProfile);
  const changePassword = useStore((state) => state.changePassword);
  const getActivities = useStore((state) => state.getActivities);
  const deleteAccount = useStore((state) => state.deleteAccount);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email || "");
  const [profilePicture, setProfilePicture] = useState(
    user.profilePicture || "👤",
  );
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activities, setActivities] = useState<any[]>([]);
  const [infoError, setInfoError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  useEffect(() => {
    getActivities()
      .then(setActivities)
      .catch((error) => console.log("Failed to load activities", error));
  }, [getActivities]);

  const saveProfile = async () => {
    if (!firstName.trim() || !lastName.trim())
      return setInfoError("First and last name cannot be empty.");
    if (!email.includes("@"))
      return setInfoError("Please enter a valid email.");
    setInfoError("");
    setInfoSuccess("");
    setLoadingInfo(true);
    try {
      await updateProfile(firstName, lastName, email, profilePicture);
      setInfoSuccess("Profile updated successfully.");
      setActivities(await getActivities());
    } catch (error: any) {
      setInfoError(error.message || "Failed to update profile.");
    } finally {
      setLoadingInfo(false);
    }
  };
  const savePassword = async () => {
    if (!oldPassword) return setPwdError("Current password is required.");
    if (newPassword.length < 6)
      return setPwdError("New password must be at least 6 characters.");
    if (newPassword !== confirmPassword)
      return setPwdError("New passwords do not match.");
    setPwdError("");
    setPwdSuccess("");
    setLoadingPwd(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPwdSuccess("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActivities(await getActivities());
    } catch (error: any) {
      setPwdError(error.message || "Failed to change password.");
    } finally {
      setLoadingPwd(false);
    }
  };
  const confirmDelete = () =>
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert(
                "Account Deleted",
                "Your account has been deleted successfully.",
              );
              router.replace("/login");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete account.",
              );
            }
          },
        },
      ],
    );

  return (
    <PhoneFrame>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.white, fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <ProfileAvatarCard
          value={profilePicture}
          onChange={setProfilePicture}
        />
        <ProfileDetailsCard
          firstName={firstName}
          lastName={lastName}
          email={email}
          error={infoError}
          success={infoSuccess}
          loading={loadingInfo}
          onFirstName={setFirstName}
          onLastName={setLastName}
          onEmail={setEmail}
          onSubmit={saveProfile}
        />
        <ProfilePasswordCard
          oldPassword={oldPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          error={pwdError}
          success={pwdSuccess}
          loading={loadingPwd}
          onOldPassword={setOldPassword}
          onNewPassword={setNewPassword}
          onConfirmPassword={setConfirmPassword}
          onSubmit={savePassword}
        />
        <ProfileActivityCard activities={activities} />
        <ProfileDangerCard onDelete={confirmDelete} />
      </ScrollView>
    </PhoneFrame>
  );
}
