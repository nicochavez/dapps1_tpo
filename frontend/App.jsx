import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './views/SplashScreen';
import LoginScreen from './views/LoginScreen';
import RegisterStep1 from './views/RegisterStep1';
import RegisterStep2 from './views/RegisterStep2';
import RegisterPending from './views/RegisterPending';
import RegisterStep3 from './views/RegisterStep3';
import HomeScreen from './views/HomeScreen';
import ExploreCatalogsScreen from './views/ExploreCatalogsScreen';
import CatalogItemsScreen from './views/CatalogItemsScreen';
import NotificationsScreen from './views/NotificationsScreen';
import BidsScreen from './views/BidsScreen';
import AddPaymentMethodScreen from './views/AddPaymentMethodScreen';
import AddressesScreen from './views/AddressesScreen';
import CompletePurchaseScreen from './views/CompletePurchaseScreen';
import EditAddressScreen from './views/EditAddressScreen';
import CreateAuctionScreen from './views/CreateAuctionScreen';
import CreateObjectStep1 from './views/CreateObjectStep1';
import CreateObjectStep2 from './views/CreateObjectStep2';
import CreateObjectStep3 from './views/CreateObjectStep3';
import ItemDetailScreen from './views/ItemDetailScreen';
import MyAuctionsScreen from './views/MyAuctionsScreen';
import ManageAuctionScreen from './views/ManageAuctionScreen';
import ViewAuctionScreen from './views/ViewAuctionScreen';
import ManageObjectScreen from './views/ManageObjectScreen';
import AuctionUnderReviewScreen from './views/AuctionUnderReviewScreen'; 
import ProfileScreen from './views/ProfileScreen';
import EditAuctionItemScreen from './views/EditAuctionItemScreen';
import { AuthProvider } from './context/AuthContext';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="RegisterStep1" component={RegisterStep1} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterStep2" component={RegisterStep2} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterPending" component={RegisterPending} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterStep3" component={RegisterStep3} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ExploreCatalogs" component={ExploreCatalogsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CatalogItems" component={CatalogItemsScreen} initialParams={{ catalogId: 'c1' }} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Bids" component={BidsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Addresses" component={AddressesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CompletePurchase" component={CompletePurchaseScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditAddress" component={EditAddressScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateAuction" component={CreateAuctionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateObjectStep1" component={CreateObjectStep1} options={{ headerShown: false }} />
          <Stack.Screen name="CreateObjectStep2" component={CreateObjectStep2} options={{ headerShown: false }} />
          <Stack.Screen name="CreateObjectStep3" component={CreateObjectStep3} options={{ headerShown: false }} />
          <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyAuctions" component={MyAuctionsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ManageAuction" component={ManageAuctionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ViewAuction" component={ViewAuctionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ManageObject" component={ManageObjectScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AuctionUnderReview" component={AuctionUnderReviewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditAuctionItem" component={EditAuctionItemScreen} options={{ headerShown: false }} />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}