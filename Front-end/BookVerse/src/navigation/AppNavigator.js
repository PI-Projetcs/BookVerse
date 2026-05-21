import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookScreen from "../screens/Book/BookScreen";
import BookDetailsScreen from "../screens/BookDetails/BookDetailsScreen";
import DiscussionScreen from "../screens/Discussion/DiscussionScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import LoginScreen from "../screens/Login/LoginScreen";
import UserScreen from "../screens/User/UserScreen";
import MyModeration from "../screens/User/MyModeration";
import Admin from "../screens/Admin/Admin";
import BookOfMonth from "../screens/Admin/BookOfMonth";
import ManageUsers from "../screens/Admin/ManageUsers";
import ModerateComments from "../screens/Admin/ModerateComments";
import AdminBooks from "../screens/Admin/AdminBooks";
import Profile from "../screens/Admin/Profile";
import RegisterBook from "../screens/Admin/RegisterBook";
import { getInitialRouteFromSession } from "./sessionRoute";
import { useAuth } from '../context/AuthContext';

const RootStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
function AdminNavigator() {
	return (
		<AdminStack.Navigator
			initialRouteName="AdminHome"
			screenOptions={{ headerShown: false }}
		>
			<AdminStack.Screen name="AdminHome" component={Admin} />
			<AdminStack.Screen name="RegisterBook" component={RegisterBook} />
			<AdminStack.Screen name="AdminBooks" component={AdminBooks} />
			<AdminStack.Screen name="ManageUsers" component={ManageUsers} />
			<AdminStack.Screen name="BookOfMonth" component={BookOfMonth} />
			<AdminStack.Screen name="ModerateComments" component={ModerateComments} />
			<AdminStack.Screen name="Profile" component={Profile} />
		</AdminStack.Navigator>
	);
}

export default function AppNavigator() {
	const { session } = useAuth();
	const initialRoute = getInitialRouteFromSession(session);
	const isAuthenticated = Boolean(session?.token && session?.role);
	const isAdmin = session?.role === 'admin';

    

	return (
		<NavigationContainer key={`${session?.role || 'guest'}:${session?.email || 'guest'}`}>
			<RootStack.Navigator
				screenOptions={{ headerShown: false }}
				initialRouteName={initialRoute}
			>
				{!isAuthenticated ? (
					<>
						<RootStack.Screen
							name="Login"
							component={LoginScreen}
							initialParams={{ initialTab: "login" }}
						/>
						<RootStack.Screen
							name="Register"
							component={LoginScreen}
							initialParams={{ initialTab: "register" }}
						/>
					</>
				) : isAdmin ? (
					<RootStack.Screen name="Admin" component={AdminNavigator} />
				) : (
					<>
						<RootStack.Screen name="Home" component={HomeScreen} />
						<RootStack.Screen name="Catalog" component={BookScreen} />
						<RootStack.Screen name="Discussion" component={DiscussionScreen} />
						<RootStack.Screen name="Profile" component={UserScreen} />
						<RootStack.Screen name="MyModeration" component={MyModeration} />
						<RootStack.Screen
							name="BookDetails"
							component={BookDetailsScreen}
							initialParams={{ id: 1 }}
						/>
					</>
				)}
			</RootStack.Navigator>
		</NavigationContainer>
	);
}