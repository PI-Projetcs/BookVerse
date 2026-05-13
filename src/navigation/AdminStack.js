// navigation -->Controle de navegação entre telas
//navegação ADMIN
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import RegisterBook from "../screens/Admin/RegisterBook";
import Admin from "../screens/Admin/Admin";
import BookOfMonth from "../screens/Admin/BookOfMonth";
import ManageUsers from "../screens/Admin/ManageUsers";
import ModerateComments from "../screens/Admin/ModerateComments";
import Profile from "../screens/Admin/Profile";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="Admin">
      <Stack.Screen name="Admin" component={Admin} />
      <Stack.Screen name="RegisterBook" component={RegisterBook} />
      <Stack.Screen name="ManageUsers" component={ManageUsers} />
      <Stack.Screen name="BookOfMonth" component={BookOfMonth} />
      <Stack.Screen name="ModerateComments" component={ModerateComments} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}
