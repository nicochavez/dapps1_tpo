import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { cambiarContrasenia } from '../services/api';

const PasswordField = ({ label, value, onChange, show, onToggle }) => (
  <>
    <Text className="font-bold text-[10px] text-slate-800 mb-2 tracking-widest uppercase">{label}</Text>
    <View className="flex-row items-center bg-slate-200/60 rounded-xl px-4 mb-6">
      <TextInput
        className="flex-1 py-3 text-slate-800 font-medium"
        placeholder="••••••••"
        placeholderTextColor="#94a3b8"
        secureTextEntry={!show}
        autoCapitalize="none"
        value={value}
        onChangeText={onChange}
      />
      <TouchableOpacity onPress={onToggle}>
        <Feather name={show ? 'eye' : 'eye-off'} size={18} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  </>
);

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  const passwordsMatch  = newPassword === confirmPassword;
  const newLongEnough   = newPassword.length >= 8;
  const isFormValid     = currentPassword.length > 0 && newLongEnough && passwordsMatch;

  const handleSave = async () => {
    if (!passwordsMatch) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (!newLongEnough) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }

    if (!currentUser?.email) {
      Alert.alert('Error', 'Session expired. Please log out and log in again.');
      return;
    }

    setLoading(true);
    try {
      await cambiarContrasenia({ email: currentUser.email, contrasenia: newPassword, contraseniaActual: currentPassword });
      Alert.alert('Success', 'Your password has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]"
    >
      {/* Header */}
      <View className="flex-row items-center px-6 pt-14 pb-4 bg-[#f8fafc]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text className="text-sm font-bold text-slate-800">Change Password</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-light text-slate-800 mt-4 mb-2">New Password</Text>
        <Text className="text-slate-500 mb-8">
          Enter your current password and choose a new one. It must be at least 8 characters.
        </Text>

        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent(v => !v)}
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew(v => !v)}
        />

        {/* Strength hint */}
        {newPassword.length > 0 && (
          <View className="mb-4 -mt-4">
            <Text className="text-xs text-slate-400">
              Strength:{' '}
              {newPassword.length < 6 && <Text className="text-red-500 font-bold">Weak</Text>}
              {newPassword.length >= 6 && newPassword.length < 10 && <Text className="text-yellow-500 font-bold">Medium</Text>}
              {newPassword.length >= 10 && <Text className="text-green-500 font-bold">Strong</Text>}
            </Text>
          </View>
        )}

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggle={() => setShowConfirm(v => !v)}
        />

        {/* Mismatch warning */}
        {confirmPassword.length > 0 && !passwordsMatch && (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 -mt-4 flex-row items-center">
            <Feather name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs font-medium ml-2">Passwords do not match.</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 py-4 bg-white border-t border-slate-100">
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isFormValid || loading}
          className={`py-4 rounded-2xl items-center justify-center shadow-sm ${
            isFormValid && !loading ? 'bg-[#a78bfa] shadow-purple-200' : 'bg-slate-300'
          }`}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text className="font-bold text-white text-base">Save New Password</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
