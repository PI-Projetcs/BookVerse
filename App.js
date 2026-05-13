import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookScreen from "./src/screens/Book/BookScreen";
import BookDetailsScreen from "./src/screens/BookDetails/BookDetailsScreen";
import DiscussionScreen from "./src/screens/Discussion/DiscussionScreen";
import HomeScreen from "./src/screens/Home/HomeScreen";
import LoginScreen from "./src/screens/Login/LoginScreen";
import UserScreen from "./src/screens/User/UserScreen";
// import RegisterScreen from './src/screens/Register/RegisterScreen';
// import ProfileScreen from './src/screens/Profile/ProfileScreen';
// import AdminDashboardScreen from './src/screens/Admin/AdminDashboardScreen';

// IMPORTS DO ADMIN
import AdminStack from "./src/navigation/AdminStack";

const Stack = createNativeStackNavigator();
//const INITIAL_ROUTE = 'Catalog';
//const INITIAL_ROUTE = 'BookDetails';
const INITIAL_ROUTE = "Login";
// const INITIAL_ROUTE = 'Catalog';
// const INITIAL_ROUTE = 'BookDetails';
// const INITIAL_ROUTE = 'Register';
// const INITIAL_ROUTE = 'Login';
// const INITIAL_ROUTE = 'Discussion';
// const INITIAL_ROUTE = 'Profile';
// const INITIAL_ROUTE = 'AdminDashboard';

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        key={INITIAL_ROUTE}
        screenOptions={{ headerShown: false }}
        initialRouteName={INITIAL_ROUTE}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          initialParams={{ initialTab: "login" }}
        />
        <Stack.Screen
          name="Register"
          component={LoginScreen}
          initialParams={{ initialTab: "register" }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Catalog" component={BookScreen} />
        <Stack.Screen name="Discussion" component={DiscussionScreen} />
        <Stack.Screen name="Profile" component={UserScreen} />
        <Stack.Screen
          name="BookDetails"
          component={BookDetailsScreen}
          initialParams={{ id: 1 }}
        />

        {/* Rotas futuras: descomentar quando as telas estiverem implementadas */}
        {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
        {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
        {/* <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} /> */}

        {/* ROTAS DO ADMIN*/}
        <Stack.Screen name="Admin" component={AdminStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
