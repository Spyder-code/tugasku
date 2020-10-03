import { Text, View, List, ListItem, Body, Right, Form, Item, Input, Label, Button, Icon, Badge } from "native-base";
import React, { useState, useEffect } from 'react';
import { ImageBackground,TouchableOpacity,Modal,Alert, StyleSheet, TextInput} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import SQLite from 'react-native-sqlite-storage';

global.db = SQLite.openDatabase(
    {
            name: 'tugas',
            location: 'default',
            createFromLocation: '~tugas.db',
            },
        () => { },
        error => {
            console.log("ERROR: " + error);
        }
    );

const Note = () => {
    SQLite.DEBUG = true;

    const [note, setNote] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [judul, setJudul] = useState('');
    const [isi, setIsi] = useState('');
    const ExecuteQuery = (sql, params = []) => new Promise((resolve, reject) => {
        db.transaction((trans) => {
                trans.executeSql(sql, params, (trans, results) => {
                resolve(results);
            },
            (error) => {
                reject(error);
            });
        });
    });

    useEffect(() => {
        getAllNote();
    }, [])

    const getAllNote = async ()=>{
        let selectQuery = await ExecuteQuery("SELECT * FROM note",[]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setNote(temp);
    }

    const insertNote = async (judul,isi) =>{
        let singleInsert = await ExecuteQuery("INSERT INTO note (judul, deskripsi) VALUES ( ?, ?)", [judul, isi]);
        console.log(singleInsert);
        getAllNote();
        setJudul('');
        setIsi('');
        setModalVisible(!modalVisible);
    }

    const deleteNote = async (id)=>{
        let deleteQuery = await ExecuteQuery('DELETE FROM note WHERE id = ?', [id]);
        console.log(deleteQuery);
        getAllNote();
    }

    const alertButton = (id,nama) =>
    Alert.alert(
    "Apakah anda yakin?",
    "Menghapus "+nama,
    [
        {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
        },
        { text: "OK", onPress: () => deleteNote(id) }
    ],
    { cancelable: false }
);

    let listItemView = (item) => {
        return (
            <View key={item.id} style={{ padding: 0, borderRadius:12, margin:10, backgroundColor: 'rgba(153, 50, 204, 0.2)' }}>
                <List>
                    <ListItem thumbnail>
                    <Body>
                        <Text style={{ fontSize:24, fontWeight:'bold', color:'white' }}>{item.judul}</Text>
                        <Text style={{ color:'white', fontSize:10 }}>25 February 2014</Text>
                        <Text style={{ color:'white' }}>{item.deskripsi}</Text>
                    </Body>
                    <Right>
                        <TouchableOpacity onPress={()=>{alertButton(item.id,item.judul)}}>
                        <Badge small danger>
                            <Text>Hapus</Text>
                        </Badge>
                        </TouchableOpacity>
                    </Right>
                    </ListItem>
                </List>
            </View>
        );
    };

    const formAdd = ()=>{
        return(
            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    }}>
                    <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ flexDirection:'row' }}>
                            <Text style={{  marginTop:6, marginRight:10}}>Judul</Text>
                            <TextInput onChangeText={text => setJudul(text)} value={judul} style={{ height: 40, borderColor: 'gray', borderWidth: 1, width:'70%' }}/>
                        </View>
                        <View style={{ flexDirection:'row', marginVertical:10  }}>
                            <Text style={{  marginTop:6, marginRight:30}}>Isi</Text>
                            <TextInput multiline={true} numberOfLines={10} style={{ height: 100, textAlignVertical:'top', borderColor: 'gray', borderWidth: 1, width:'70%' }} onChangeText={text => setIsi(text)} value={isi}/>
                        </View>
                        <View style={{ flexDirection:'row'  }}>
                        <TouchableOpacity style={{ margin:10 }} onPress={() => {insertNote(judul,isi)}}>
                            <Badge success>
                                <Text>Tambah</Text>
                            </Badge>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ margin:10 }} onPress={() => {setModalVisible(!modalVisible);}}>
                            <Badge danger>
                                <Text>Cancel</Text>
                            </Badge>
                        </TouchableOpacity>
                        </View>
                    </View>
                    </View>
                </Modal>
            </View>
        )
    }
    return (
        <SafeAreaView>
            <ImageBackground source={require('../images/bg.png')} style={{ width:'100%', height:'100%' }}>
                <View style={{ flexDirection:'row', height:90, justifyContent:'center', marginTop:25 }}>
                    <Text style={{ color:'white', fontSize:20, fontFamily:'sans-serif', fontWeight:'100' }}>Ayo buat catatan disini!</Text>
                </View>
                    <TouchableOpacity onPress={()=>{setModalVisible(true)}}>
                        <View style={{ backgroundColor:'rgba(48, 206, 209,0.2)', borderRadius:15, height:40, width:'40%', padding:5, justifyContent:'center', flexDirection:'row', borderColor:'#9932CC', borderWidth:2, margin:10 }}>
                            <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Tambah catatan</Text>
                        </View>
                    </TouchableOpacity>
                    {modalVisible?formAdd():<View></View>}
                <FlatList
                    data={note}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => listItemView(item)}
                />
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22
    },
    modalView: {
      margin: 30,
      width:'90%',
      backgroundColor: 'rgba(48, 206, 209, 1)',
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    openButton: {
      backgroundColor: "#F194FF",
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    }
  });
  

export default Note;