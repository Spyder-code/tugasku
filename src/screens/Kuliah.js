import { Icon, Text, View, Item, Picker, Badge, Input, List, ListItem, Body } from "native-base";
import * as React from 'react';
import { useState, useEffect } from "react";
import { ImageBackground, SafeAreaView, Alert, ScrollView, FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import SQLite from 'react-native-sqlite-storage';
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

const Kuliah = () => {
    SQLite.DEBUG = true;
    const [kuliah, setKuliah] = useState(true);
    const [hari, setHari] = useState(1);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [todo, setTodo] = useState([]);
    const [semuaMatkul, setSemuaMatkul] = useState([]);
    const [matkul, setMatkul] = useState('')
    const [wMulai, setWMulai] = useState(undefined);
    const [wAkhir, setWAkhir] = useState(undefined);
    const [statusW, setStatusW] = useState(false);
    const [senin, setSenin] = useState([]);
    const [selasa, setSelasa] = useState([]);
    const [rabu, setRabu] = useState([]);
    const [kamis, setKamis] = useState([]);
    const [jumat, setJumat] = useState([]);
    const [sabtu, setSabtu] = useState([]);
    const [minggu, setMinggu] = useState([]);

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

    const getAllTodo = async ()=>{
        let selectQuery = await ExecuteQuery("SELECT * FROM todo WHERE status = 0",[]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setTodo(temp);
    }
    const getAllJadwal = async ()=>{
        for (let i = 0; i <7 ; i++) {
            let selectQuery = await ExecuteQuery("SELECT * FROM matkul WHERE hari = ?",[i]);
            var rows = selectQuery.rows;
            var temp = [];
            for (let i = 0; i < rows.length; i++) {
                var item = rows.item(i);
                temp.push(item);
            }
            if (i==0) {
                setMinggu(temp);
            } else if(i==1){
                setSenin(temp);
            }else if(i==2){
                setSelasa(temp);
            }else if(i==3){
                setRabu(temp);
            }else if(i==4){
                setKamis(temp);
            }else if(i==5){
                setJumat(temp);
            }else{
                setSabtu(temp);
            }
        }
    }

    const getSemuaMatkul = async()=>{
        let selectQuery = await ExecuteQuery("SELECT * FROM matkul",[]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        };
        setSemuaMatkul(temp);
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
        { text: "OK", onPress: () => deleteJadwal(id) }
    ],
    { cancelable: false }
);

    const refresh = ()=>{
        getAllJadwal();
        getAllTodo();
        getSemuaMatkul();
        setForm();
    }

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };
    
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };
    
    const handleConfirmMulai = (date) => {
        var a = formatDate(date);
        setWMulai(a);
    };
    const handleConfirmAkhir = (date) => {
        var a = formatDate(date);
        setWAkhir(a);
    };

    const formatDate = (waktu)=>{
        var date = new Date(waktu);
        var a = date.getHours();
        var b = date.getMinutes();
        return a+':'+b;
    }

    const setForm = ()=>{
        setMatkul('');
        setHari(1);
        setWAkhir(null);
        setWMulai(null);
        setDatePickerVisibility(false);
        setStatusW(false);
    }

    const insertJadwal = async () =>{
        if(matkul!='' && hari!='' && wMulai && wAkhir){
            let singleInsert = await ExecuteQuery("INSERT INTO matkul (nama, hari, jam_mulai, jam_akhir) VALUES ( ?, ?, ?, ?)", [matkul, hari, wMulai, wAkhir]);
            console.log(singleInsert);
            refresh();
            setForm();
        }else{
            alert('Form harus terisi semua!');
        }
    }

    const deleteJadwal = async (id)=>{
        let deleteQuery = await ExecuteQuery('DELETE FROM matkul WHERE id = ?', [id]);
        console.log(deleteQuery);
        refresh();
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

    const adaHari = (data)=>{
        return(
            data.map((item)=>
                <View key={item.id} style={{ backgroundColor:'rgba(48, 206, 209, 0.3)', padding:3, margin:5, flexDirection:'row' }}>
                    <View style={{ width:'40%' }}>
                        <Text style={{ color:'white', fontSize:18, marginLeft:10  }}>- {item.nama} </Text>
                    </View>
                    <View style={{ width:'40%' }}>
                        <Text style={{ color:'white', fontSize:18 }}>{item.jam_mulai} - {item.jam_akhir} </Text>
                    </View>
                    <View style={{ width:'20%' }}>
                        <TouchableOpacity onPress={()=>{alertButton(item.id,item.nama)}}>
                            <Badge danger small>
                                <Text>Hapus</Text>
                            </Badge>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        )
    }

    const day = (item,data)=>{
        return(
            <View>
                <Text style={{ color:'white', fontWeight:'bold', fontSize:20, marginLeft:15 }}> {item} </Text>
                <View style={{ borderBottomColor: 'white', borderBottomWidth: 3}}/>
                {adaHari(data)}
            </View>
        )
    }

    const jadwal = ()=>{
        return(
            <View>
                {senin.length>0?day('Senin',senin):<View></View>}
                {selasa.length>0?day('Selasa',selasa):<View></View>}
                {rabu.length>0?day('Rabu',rabu):<View></View>}
                {kamis.length>0?day('Kamis',kamis):<View></View>}
                {jumat.length>0?day('Jumah',jumat):<View></View>}
                {sabtu.length>0?day('Sabtu',sabtu):<View></View>}
                {minggu.length>0?day('Minggu',minggu):<View></View>}
            </View>
        )
    }

    const jadwalKuliah = ()=>{
        return (
            <View>
                {semuaMatkul.length>0?jadwal():kosong()}
            </View>
        )
    }

    const kuliahView = ()=>{
        return(
            <ScrollView>
            <View>
                <View style={{ padding: 5, borderRadius:12, margin:15, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Jadwal</Text>
                    </View>
                    {jadwalKuliah()}
                </View>
                <View style={{ padding: 10, borderRadius:12, margin:10, backgroundColor: 'rgba(153, 50, 204, 0.5)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'60%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Tambah Jadwal</Text>
                    </View>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Nama Aktivitas/ Pelajaran/ Mata Kuliah</Text>
                    <Item inlineLabel>
                        <Input style={{ color:'rgb(0, 206, 209)', backgroundColor:'rgba(255, 255, 255,0.2)' }} onChangeText={text => setMatkul(text)} value={matkul}/>
                    </Item>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Hari</Text>
                    <Item picker>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="arrow-down" />}
                            style={{ width: undefined, color:'rgb(0, 206, 209)' }}
                            placeholder="Select your SIM"
                            placeholderStyle={{ color: "#bfc6ea" }}
                            placeholderIconColor="#007aff"
                            selectedValue={hari}
                            onValueChange={value=> setHari(value)}
                        >
                            <Picker.Item label="Senin" value="1" />
                            <Picker.Item label="Selasa" value="2" />
                            <Picker.Item label="Rabu" value="3" />
                            <Picker.Item label="Kamis" value="4" />
                            <Picker.Item label="Jum'ah" value="5" />
                            <Picker.Item label="Sabtu" value="6" />
                            <Picker.Item label="Minggu" value="0" />
                        </Picker>
                    </Item>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Jam Mulai</Text>
                    <TouchableOpacity onPress={showDatePicker}>
                        <View style={{ flexDirection:'row', padding:5 }}>
                            <Ionicons name='calendar' size={30} color='white'/>
                            <Text style={{ color:'white', fontSize:20, marginLeft:10 }}>{wMulai}</Text>
                        </View>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="time"
                        onConfirm={handleConfirmMulai}
                        onCancel={hideDatePicker}
                    />
                    <Text style={{ color:'white', fontWeight:'bold' }}>Jam Berakhir</Text>
                    <TouchableOpacity onPress={()=>{setStatusW(true)}}>
                        <View style={{ flexDirection:'row', padding:5 }}>
                            <Ionicons name='calendar' size={30} color='white'/>
                            <Text style={{ color:'white', fontSize:20, marginLeft:10 }}>{wAkhir}</Text>
                        </View>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={statusW}
                        mode="time"
                        onConfirm={handleConfirmAkhir}
                        onCancel={()=>{setStatusW(false)}}
                    />
                    <TouchableOpacity style={{ margin:10 }} onPress={() => {insertJadwal()}}>
                        <Badge large success>
                            <Text>Tambah</Text>
                        </Badge>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        )
    }

    const renderTodo=(item)=>{
        return(
            <View key={item.id}>
                <View style={{ padding: 10, borderRadius:12, margin:15, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>{item.waktu}</Text>
                    </View>
                    <View style={{ position:'relative', top:-20 }}>
                        <Text style={{ fontWeight:'bold', fontSize:24, color:'white' }}>{item.judul}</Text>
                        <Text style={{ color:'white', fontSize:13 }}>Mulai: {item.waktu}</Text>
                        <Text style={{ color:'white', fontSize:18 }}>{item.deskripsi}</Text>
                    </View>
                </View>
            </View>
        )
    }


    const todoView = ()=>{
        return(
            <FlatList
                data={todo}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={kosong()}
                renderItem={({ item }) => renderTodo(item)}
            />
        )
    }

    return (
        <SafeAreaView>
            <ImageBackground source={require('../images/bg-1.jpg')}  style={{ width:'100%', height:'100%' }}>
            <View style={{ height:90, justifyContent:'center', marginVertical:15, padding:10 }}>
                    <Text style={{ color:'white', fontSize:30, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 5}, textShadowRadius: 15 }}>Atur</Text>
                    <Text style={{ color:'white', fontSize:30, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 5}, textShadowRadius: 15 }}>Jadwal Aktivitasmu</Text>
                    <Text style={{ color:'white', fontSize:15, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 2}, textShadowRadius: 10 }}>Lakukan sesuai jadwal</Text>
                </View>
                <View style={{ borderBottomColor: 'white', borderBottomWidth: 1, width:'75%'}}/>
                <View style={{ flexDirection:'row', padding:10, justifyContent:'center', backgroundColor: 'rgba(153, 50, 204, 0.9)', borderRadius:12, margin:15, borderColor:'white', borderWidth:2 }}>
                    <TouchableOpacity onPress={()=>{setKuliah(true)}}>
                        <View style={{ backgroundColor:kuliah?'rgba(0, 206, 209,1)':'rgba(0, 206, 209,0.1)', borderRadius:15, height:40, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'white', borderWidth:2, margin:10, width:100 }}>
                            <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Jadwal</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{setKuliah(false)}}>
                        <View style={{ backgroundColor:!kuliah?'rgba(0, 206, 209,1)':'rgba(0, 206, 209,0.1)', borderRadius:15, height:40, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'white', borderWidth:2, margin:10, width:100 }}>
                            <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Todo List</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop:10, marginHorizontal:5 }} onPress={()=>{_refresh}}>
                            <Ionicons name='refresh-outline' color='white' size={30}/>
                        </TouchableOpacity>
                </View>
                {kuliah?kuliahView():todoView()}
            </ImageBackground>
        </SafeAreaView>
    );
}

export default Kuliah;