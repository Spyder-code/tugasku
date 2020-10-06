import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Tugas from '../screens/Tugas'
import Note from '../screens/Note'
import Kuliah from '../screens/Kuliah'
import Todo from '../screens/Todo'
import Home from '../screens/Home'
function DetailsScreen() {
  return (
    <Tugas/>
  );
}

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text>Home screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

function SettingsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

const HomeStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
      <HomeStack.Screen name="Details" component={DetailsScreen} />
    </HomeStack.Navigator>
  );
}

const SettingsStack = createStackNavigator();

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Details" component={DetailsScreen} />
    </SettingsStack.Navigator>
  );
}

const JadwalStack = createStackNavigator();

function JadwalStackScreen() {  
  return(
    <JadwalStack.Navigator>
      <JadwalStack.Screen name='kuliah' component={Kuliah} options={{headerShown: false}}/>
      <JadwalStack.Screen name='todo' component={Todo} />
    </JadwalStack.Navigator>
  )
}

const TugasStack = createStackNavigator();

function TugasStackScreen() {  
  return(
    <TugasStack.Navigator>
      <TugasStack.Screen name='tugas' component={Tugas} options={{headerShown: false}}/>
      <TugasStack.Screen name='todo' component={Todo} options={{headerShown: false}}/>
    </TugasStack.Navigator>
  )
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
                iconName = focused
                ? 'home': 'home';
            } else if (route.name === 'Jadwal') {
                iconName = focused ? 'calendar' : 'calendar';
            }else if (route.name === 'Tugas') {
                iconName = focused ? 'list' : 'list';
            }else if (route.name === 'Note') {
                iconName = focused ? 'document-outline' : 'document-outline';
            }else if (route.name === 'Todo') {
              iconName = focused ? 'pricetags-outline' : 'pricetags-outline';
          }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
            activeTintColor: '#00CED1',
            inactiveTintColor: 'white',
            style: {
                backgroundColor: 'rgba(153, 50, 204,0.7)',
            },
        }}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Jadwal" component={JadwalStackScreen} />
        <Tab.Screen name="Tugas" component={Tugas} />
        <Tab.Screen name="Todo" component={Todo} />
        <Tab.Screen name="Note" component={Note} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
