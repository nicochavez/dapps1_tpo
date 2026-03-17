import { SafeAreaView } from 'react-native'
import './global.css'
import AuthScreen from './components/AuthScreen'

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AuthScreen />
    </SafeAreaView>
  )
}
