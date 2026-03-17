// screens/AuthScreen.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { Svg, Path, Rect } from 'react-native-svg'

// Logo Component
const BidMasterLogo = () => (
  <View className="w-16 h-16 bg-purple-800 rounded-2xl items-center justify-center">
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L4 7V9H20V7L12 3Z" fill="white" />
      <Path d="M5 11V18H7V11H5ZM11 11V18H13V11H11ZM17 11V18H19V11H17Z" fill="white" />
      <Path d="M4 20H20V22H4V20Z" fill="white" />
    </Svg>
  </View>
)

// Google Icon
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
)

// Apple Icon
const AppleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#000">
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </Svg>
)

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="items-center pt-12 pb-8">
          <BidMasterLogo />
          <Text className="text-2xl font-bold text-purple-900 mt-4">BidMaster</Text>
          <Text className="text-gray-500 mt-1">Join the live action, bid to win.</Text>
        </View>

        {/* Card Container */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
          {/* Tabs */}
          <View className="flex-row mb-6">
            <TouchableOpacity
              className={`flex-1 pb-3 border-b-2 ${
                activeTab === 'login' ? 'border-purple-800' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('login')}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'login' ? 'text-purple-900' : 'text-gray-400'
                }`}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 pb-3 border-b-2 ${
                activeTab === 'register' ? 'border-purple-800' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('register')}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'register' ? 'text-purple-900' : 'text-gray-400'
                }`}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-gray-600 tracking-wider mb-2">
              EMAIL ADDRESS
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
              placeholder="name@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Field */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-semibold text-gray-600 tracking-wider">PASSWORD</Text>
              <TouchableOpacity>
                <Text className="text-purple-800 font-medium text-sm">Forgot?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            className="bg-purple-800 rounded-xl py-4 items-center mb-6"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Sign In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-xs tracking-wider">OR CONTINUE WITH</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Buttons */}
          <View className="flex-row flex-wrap gap-3">
            <TouchableOpacity
              className="flex-1 min-w-[44%] flex-row items-center justify-center border border-gray-200 rounded-xl py-3.5"
              activeOpacity={0.7}
            >
              <GoogleIcon />
              <Text className="ml-2 font-medium text-gray-700">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 min-w-[44%] flex-row items-center justify-center border border-gray-200 rounded-xl py-3.5"
              activeOpacity={0.7}
            >
              <AppleIcon />
              <Text className="ml-2 font-medium text-gray-700">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-8">
          <View className="flex-row">
            <Text className="text-gray-500">New to BidMaster? </Text>
            <TouchableOpacity>
              <Text className="text-purple-800 font-semibold">Create an account</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row mt-4 items-center">
            <TouchableOpacity>
              <Text className="text-gray-400 text-sm">Privacy Policy</Text>
            </TouchableOpacity>
            <Text className="text-gray-300 mx-3">•</Text>
            <TouchableOpacity>
              <Text className="text-gray-400 text-sm">Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
