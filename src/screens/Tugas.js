import { Text, View, List, ListItem, Body, Right, Form, Item, Input, Label, Button, Icon, Badge, Textarea, Picker } from "native-base";
import React, { useState, useEffect } from 'react';
import { ImageBackground,TouchableOpacity,Modal,Alert, StyleSheet, TextInput, ScrollView, RefreshControl} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import SQLite from 'react-native-sqlite-storage';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';

global.db = SQLite.openDatabase(
    {
            name: 'db',
            location: 'default',
            createFromLocation: '~db.db',
            },
        () => { },
        error => {
            console.log("ERROR: " + error);
        }
    );

const Tugas = ({navigation}) => {
    SQLite.DEBUG = true;

    const [type, setType] = useState(1);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [waktu, setWaktu] = useState(null);
    const [deskripsi, setDeskripsi] = useState('');
    const [matkul, setMatkul] = useState(1);
    const [jadwal, setJadwal] = useState([]);
    const [tugas, setTugas] = useState([]);
    const [tugasF, setTugasF] = useState([]);
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
        refresh();
    }, [])

    const refresh = ()=>{
        getAllMatakuliah();
        getAllTugasProgress();
        getAllTugasFinish();
    }
    const getAllTugasProgress = async ()=>{
        let selectQuery = await ExecuteQuery("SELECT tugas.*, matkul.nama FROM tugas INNER JOIN matkul ON matkul.id = tugas.matkul_id  WHERE status = 0",[]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setTugas(temp);
    }

    const getAllTugasFinish = async ()=>{
        let selectQuery = await ExecuteQuery("SELECT tugas.*, matkul.nama FROM tugas INNER JOIN matkul ON matkul.id = tugas.matkul_id  WHERE status = 1",[]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setTugasF(temp);
    }

    const getAllMatakuliah = async()=>{
        let selectQuery = await ExecuteQuery("SELECT * FROM matkul",[]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setJadwal(temp);
    }

    const insertTugas = async (matkul_id,deskripsi,deadline) =>{
        if(deskripsi!=''&&deadline){
            let singleInsert = await ExecuteQuery("INSERT INTO tugas (matkul_id, deskripsi, deadline, status) VALUES ( ?, ?, ?, ?)", [matkul_id, deskripsi,deadline,0]);
            console.log(singleInsert);
            refresh();
            setDeskripsi('');
            setType(1);
            setWaktu(null);
        }else{
            alert('Form tidak boleh kosong!');
        }
    }

    const updateStatus= async(id)=>{
        let updateQuery = await ExecuteQuery('UPDATE tugas SET status = 1 WHERE id = ?', [id]);
        console.log(updateQuery);
        refresh();
    }

    const deleteTugas= async (id)=>{
        let deleteQuery = await ExecuteQuery('DELETE FROM tugas WHERE id = ?', [id]);
        console.log(deleteQuery);
        refresh();
    }

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };
    
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };
    
    const handleConfirm = (date) => {
        var a = new Date(date);
        var tgl = a.getDate();
        var bln = a.getMonth()+1;
        var thn = a.getFullYear();
        var tanggal = tgl+'-'+bln+'-'+thn;
        setWaktu(tanggal);
    };

    const alertButtonDelete = (id,nama) =>
        Alert.alert(
        "Apakah anda yakin?",
        "Menghapus "+nama,
        [
            {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
            },
            { text: "OK", onPress: () => deleteTugas(id) }
        ],
        { cancelable: false }
    );

    const alertButtonUpdate = (id,nama) =>
        Alert.alert(
        "Apakah anda yakin?",
        "Menandai "+nama+ " sebagai progres selesai ?",
        [
            {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
            },
            { text: "OK", onPress: () => updateStatus(id) }
        ],
        { cancelable: false }
    );

    const listMatkul=()=>{
        return(
            jadwal.map((item)=>
                <Picker.Item key={item.id} label={item.nama} value={item.id} />
            )
        )
    }

    const btnCek = (id,nama)=>{
        return(
            <TouchableOpacity onPress={()=>{alertButtonUpdate(id,nama)}}>
                <Badge small success>
                    <Text>Tandai sbg Selesai</Text>
                </Badge>
            </TouchableOpacity>
        )
    }

    let listItemView = (item) => {
        return (
            <View key={item.id} style={{ padding: 0, borderRadius:12, margin:10, backgroundColor: 'rgba(153, 50, 204, 0.2)' }}>
                <List>
                    <ListItem thumbnail>
                    <Body>
                        <Text style={{ fontSize:24, fontWeight:'bold', color:'white' }}>{item.nama}</Text>
                        <Text style={{ color:'white', fontSize:13 }}>Deadline: {item.deadline}</Text>
                        <Text style={{ color:'white', fontSize:18 }}>{item.deskripsi}</Text>
                    </Body>
                    <Right>
                        <Text style={{ color:'white', fontSize:14, marginBottom:3 }}>
                            Status: {item.status==0?'On proses':'Finish'}
                        </Text>
                        {item.status==0?btnCek(item.id,item.nama):<View></View>}
                        <TouchableOpacity onPress={()=>{alertButtonDelete(item.id,item.nama)}}>
                            <Badge small danger style={{ marginTop:3 }}>
                                <Text>Hapus tugas</Text>
                            </Badge>
                        </TouchableOpacity>
                    </Right>
                    </ListItem>
                </List>
            </View>
        );
    };

    const kosong = ()=>{
        return(
            <View style={{ padding: 0, borderRadius:12, justifyContent:'center', margin:10, backgroundColor: 'rgba(153, 50, 204, 0.2)' }}>
                <List>
                    <ListItem thumbnail>
                    <Body>
                        <Text style={{ fontSize:24, fontWeight:'bold', color:'white' }}>Tidak ada data!</Text>
                    </Body>
                </ListItem>
            </List>
        </View>
        )
    }

    const ada = (data)=>{
        return(
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => listItemView(item)}
            />
        )
    }

    const typeProgres = ()=>{
        return(
            <View>
                {tugas.length>0?ada(tugas):kosong()}
            </View>
        )
    }
    const typeFinish = ()=>{
        return(
            <View>
                {tugasF.length>0?ada(tugasF):kosong()}
            </View>
        )
    }
    const typeAdd = ()=>{
        return(
            <ScrollView>
                <View style={{ padding: 10, borderRadius:12, margin:10, marginTop:20, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Add Task</Text>
                    </View>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Mata Kuliah</Text>
                    <Item picker>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="arrow-down" />}
                            style={{ width: undefined, color:'rgb(0, 206, 209)' }}
                            placeholder="Select your SIM"
                            placeholderStyle={{ color: "#bfc6ea" }}
                            placeholderIconColor="#007aff"
                            selectedValue={matkul}
                            onValueChange={value=> setMatkul(value)}
                        >
                            {listMatkul()}
                        </Picker>
                    </Item>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Deskripsi</Text>
                    <Textarea rowSpan={5} bordered style={{ color:'rgb(0, 206, 209)', backgroundColor:'rgba(255, 255, 255,0.2)' }} onChangeText={text => setDeskripsi(text)} value={deskripsi}/>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Deadline</Text>
                    <TouchableOpacity onPress={showDatePicker}>
                        <View style={{ flexDirection:'row', padding:5 }}>
                            <Ionicons name='calendar' size={30} color='white'/>
                            <Text style={{ color:'white', fontSize:20 }}>{waktu}</Text>
                        </View>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                        <TouchableOpacity style={{ margin:10 }} onPress={() => {insertTugas(matkul,deskripsi,waktu)}}>
                            <Badge large success>
                                <Text>Tambah</Text>
                            </Badge>
                        </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }

    return (
        <SafeAreaView>
            <ImageBackground source={require('../images/bg.png')} style={{ width:'100%', height:'100%' }}>
                <View style={{ flexDirection:'row', height:90, justifyContent:'center', marginTop:25 }}>
                    <Text style={{ color:'white', fontSize:20, fontFamily:'sans-serif', fontWeight:'100' }}>Ayo rekap tugasmu disini!</Text>
                </View>
                <View style={{ flexDirection:'row', justifyContent:'center' }}>
                    <ScrollView horizontal={true}>
                    <TouchableOpacity onPress={()=>{setType(1)}}>
                            <View style={{ backgroundColor:type==1?'rgba(0, 206, 209,1)':'rgba(48, 206, 209,0.2)', borderRadius:15, height:40, width:100, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'#9932CC', borderWidth:2, margin:10 }}>
                                <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Progress</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{setType(3)}}>
                            <View style={{ backgroundColor:type==3?'rgba(0, 206, 209,1)':'rgba(48, 206, 209,0.2)', borderRadius:15, height:40, width:100, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'#9932CC', borderWidth:2, margin:10 }}>
                                <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Finish</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{setType(4)}}>
                            <View style={{ backgroundColor:type==4?'rgba(0, 206, 209,1)':'rgba(48, 206, 209,0.2)', borderRadius:15, height:40, width:100, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'#9932CC', borderWidth:2, margin:10 }}>
                                <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Add Task</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
                {type==1?typeProgres():(type==3?typeFinish():typeAdd())}
            </ImageBackground>
        </SafeAreaView>
    );
}


export default Tugas;