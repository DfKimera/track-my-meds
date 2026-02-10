import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen';
import {AddMedicationScreen} from '../screens/AddMedicationScreen';
import {MedicationDetailScreen} from '../screens/MedicationDetailScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddMedication"
          component={AddMedicationScreen}
          options={({route}: any) => ({
            title: route.params?.medication ? 'Edit Medication' : 'Add Medication',
          })}
        />
        <Stack.Screen
          name="MedicationDetail"
          component={MedicationDetailScreen}
          options={{
            title: 'Medication Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
