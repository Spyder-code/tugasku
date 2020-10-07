import React from 'react';
import Navigasi from './src/navigations/Navigator'
import SplashScreen from 'react-native-splash-screen'
class App extends React.Component {
  componentDidMount() {
    // do stuff while splash screen is shown
      // After having done stuff (such as async tasks) hide the splash screen
      SplashScreen.hide();
  }
  render() {
    return (
      <Navigasi/>
    );
  }
}

export default App;