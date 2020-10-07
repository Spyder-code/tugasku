import { Text, View, List, ListItem, Body, Right, Left, Item, Input, Header, Title, Badge, Textarea } from "native-base";
import React, { useState, useEffect } from 'react';
import { ImageBackground,TouchableOpacity,Modal,Alert, StyleSheet, ScrollView, Button} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import SQLite from 'react-native-sqlite-storage';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import PTRView from 'react-native-pull-to-refresh';

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

const Todo = ({navigation}) => {
    SQLite.DEBUG = true;

    const [modalVisible, setModalVisible] = useState(false);
    const [type, setType] = useState(1);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [waktu, setWaktu] = useState(null);
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [todoF, setTodoF] = useState([]);
    const [todoP, setTodoP] = useState([]);
    const [timeF, setTimeF] = useState('');

    const _refresh = ()=> {
        refresh();
    }

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

    const refresh=()=>{
        getAllTodoF();
        getAllTodoP();
    }
    
    const getAllTodoF = async ()=>{
        let selectQuery = await ExecuteQuery("SELECT * FROM todo WHERE status = ?",[1]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setTodoF(temp);
    }
    const getAllTodoP = async ()=>{
        let selectQuery = await ExecuteQuery("SELECT * FROM todo WHERE status = ?",[0]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        var data = temp.reverse();
        setTodoP(data);
    }

    const insertTodo = async (judul,waktu,deskripsi) =>{
        if(judul!=''&&waktu&&deskripsi!=''){
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September","October", "November", "December"];
            var w = new Date(waktu);
            var wMont = w.getMonth()+1;
            var a = new Date();
            var tgl = a.getDate();
            var bln = a.getMonth();
            var thn = a.getFullYear();
            var tanggal = tgl+', '+monthNames[bln]+' '+thn;
            var c = w.getDate()+'-'+wMont+'-'+w.getFullYear();
            let singleInsert = await ExecuteQuery("INSERT INTO todo (judul, waktu, deskripsi, status, created_at) VALUES ( ?, ?, ?, ?, ?)", [judul, c, deskripsi, 0, tanggal]);
            console.log(singleInsert);
            refresh();
            setJudul('');
            setDeskripsi('');
            setWaktu(null);
            setType(1);
            setTimeF('');
            setDatePickerVisibility(false);
        }else{
            alert('Form tidak boleh kosong!');
        }
    }

    const deleteTodo = async (id)=>{
        let deleteQuery = await ExecuteQuery('DELETE FROM todo WHERE id = ?', [id]);
        console.log(deleteQuery);
        refresh();
    }

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
            { text: "OK", onPress: () => deleteTodo(id) }
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

    const btnCek = (id,nama)=>{
        return(
            <TouchableOpacity onPress={()=>{alertButtonUpdate(id,nama)}}>
                <Badge small success>
                    <Text>Tandai sbg Selesai</Text>
                </Badge>
            </TouchableOpacity>
        )
    }

    const updateStatus= async(id)=>{
        let updateQuery = await ExecuteQuery('UPDATE todo SET status = ? WHERE id = ?', [1,id]);
        console.log(updateQuery);
        refresh();
    }

    let listItemView = (item,data) => {
            return (
                <View key={item.id} style={{ padding: 0, borderRadius:12, margin:10, backgroundColor: 'rgba(153, 50, 204, 0.2)' }}>
                    <List>
                        <ListItem thumbnail>
                        <Body>
                            <Text style={{ fontSize:24, fontWeight:'bold', color:'white' }}>{item.judul}</Text>
                            <Text style={{ color:'white', fontSize:13 }}>Mulai: {item.waktu}</Text>
                            <Text style={{ color:'white', fontSize:18 }}>{item.deskripsi}</Text>
                        </Body>
                        <Right>
                            <Text style={{ color:'white', fontSize:14, marginBottom:3 }}>
                                Status: {item.status==0?'On proses':'Finish'}
                            </Text>
                            {item.status==0?btnCek(item.id,item.judul):<View></View>}
                            <TouchableOpacity onPress={()=>{alertButtonDelete(item.id,item.judul)}}>
                                <Badge small danger style={{ marginTop:3 }}>
                                    <Text>Hapus todo</Text>
                                </Badge>
                            </TouchableOpacity>
                        </Right>
                        </ListItem>
                    </List>
                </View>
            );
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };
    
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };
    
    const handleConfirm = (date) => {
        setWaktu(date);
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September","October", "November", "December"];
        var a = new Date(date);
        var tgl = a.getDate();
        var bln = a.getMonth();
        var thn = a.getFullYear();
        var tanggal = tgl+', '+monthNames[bln]+' '+thn;
        setTimeF(tanggal);
    };

    const typeProgress = ()=>{
        return(
                // {todoP.length>0?ada(todoP):kosong()}
            <FlatList
            data={todoP}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={kosong()}
            renderItem={({ item }) => listItemView(item)}
            />
        )
    }

    const typeFinish = ()=>{
        return(
            <FlatList
            data={todoF}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={kosong()}
            renderItem={({ item }) => listItemView(item)}
            />
        )
    }

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

    const typeAdd = ()=>{
        return(
            <ScrollView>
                <View style={{ padding: 10, borderRadius:12, margin:10, marginTop:20, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Add Todo</Text>
                    </View>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Judul</Text>
                    <Item inlineLabel>
                        <Input bordered style={{ color:'rgb(0, 206, 209)', backgroundColor:'rgba(255, 255, 255,0.2)' }} onChangeText={text => setJudul(text)} value={judul}/>
                    </Item>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Deskripsi</Text>
                    <Textarea rowSpan={5} bordered style={{ color:'rgb(0, 206, 209)', backgroundColor:'rgba(255, 255, 255,0.2)' }} onChangeText={text => setDeskripsi(text)} value={deskripsi}/>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Tanggal Mulai Mengerjakan</Text>
                    <TouchableOpacity onPress={showDatePicker}>
                        <View style={{ flexDirection:'row', padding:5 }}>
                            <Ionicons name='calendar' size={30} color='white'/>
                            <Text style={{ color:'white', fontSize:20 }}>{timeF}</Text>
                        </View>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                        <TouchableOpacity style={{ margin:10 }} onPress={() => {insertTodo(judul,waktu,deskripsi)}}>
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
            <ImageBackground source={require('../images/bg-1.jpg')} style={{ width:'100%', height:'100%' }}>
            <View style={{ height:90, justifyContent:'center', marginVertical:15, padding:10 }}>
                    <Text style={{ color:'white', fontSize:30, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 5}, textShadowRadius: 15 }}>Tulis Apa Yang</Text>
                    <Text style={{ color:'white', fontSize:30, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 5}, textShadowRadius: 15 }}>Kamu Kerjakan Kedepan!</Text>
                    <Text style={{ color:'white', fontSize:15, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 2}, textShadowRadius: 10 }}>Kerjakan sesuai apa yang kamu tulis</Text>
                </View>
                <View style={{ borderBottomColor: 'white', borderBottomWidth: 1, width:'75%'}}/>
                    <View style={{ flexDirection:'row', justifyContent:'center' }}>
                        <TouchableOpacity onPress={()=>{setType(1)}}>
                            <View style={{ backgroundColor:type==1?'rgba(0, 106, 209,1)':'rgba(48, 206, 209,0.2)', borderRadius:15, height:40, width:100, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'#9932CC', borderWidth:2, margin:5 }}>
                                <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Progress</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{setType(2)}}>
                            <View style={{ backgroundColor:type==2?'rgba(0, 106, 209,1)':'rgba(48, 206, 209,0.2)', borderRadius:15, height:40, width:100, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'#9932CC', borderWidth:2, margin:5 }}>
                                <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Finish</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{setType(3)}}>
                            <View style={{ backgroundColor:type==3?'rgba(0, 106, 209,1)':'rgba(48, 206, 209,0.2)', borderRadius:15, height:40, width:100, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'#9932CC', borderWidth:2, margin:5 }}>
                                <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Add Todo</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop:10, marginHorizontal:5 }} onPress={()=>{_refresh}}>
                            <Ionicons name='refresh-outline' color='white' size={30}/>
                        </TouchableOpacity>
                    </View>
                {type==1?typeProgress():(type==2?typeFinish():typeAdd())}
            </ImageBackground>
        </SafeAreaView>
    );
}

export default Todo;