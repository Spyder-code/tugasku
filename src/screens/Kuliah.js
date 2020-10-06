import { Icon, Text, View, Item, Picker, Badge, Input, List, ListItem, Body } from "native-base";
import * as React from 'react';
import { useState, useEffect } from "react";
import { ImageBackground, SafeAreaView, TextInput, Button, ScrollView, FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import SQLite from 'react-native-sqlite-storage';

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
    const [jadwal, setJadwal] = useState([]);
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

    const refresh = ()=>{
        getAllJadwal();
        getAllTodo();
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
    }

    const insertJadwal = async () =>{
        let singleInsert = await ExecuteQuery("INSERT INTO matkul (nama, hari, jam_mulai, jam_akhir) VALUES ( ?, ?, ?, ?)", [matkul, hari, wMulai, wAkhir]);
        console.log(singleInsert);
        refresh();
        setForm();
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
                <Text key={item.id} style={{ color:'white', fontWeight:'bold', fontSize:15, marginLeft:10  }}>- {item.nama} </Text>
            )
        )
    }

    const jadwalKuliah = ()=>{
        return (
            <View>
                <Text style={{ color:'white', fontWeight:'bold', fontSize:20  }}>Senin</Text>
                <View>{adaHari(senin)}</View>
                <Text style={{ color:'white', fontWeight:'bold', fontSize:20  }}>Selasa</Text>
                <View>{adaHari(selasa)}</View>
                <Text style={{ color:'white', fontWeight:'bold', fontSize:20  }}>Rabu</Text>
                <View>{adaHari(rabu)}</View>
                <Text style={{ color:'white', fontWeight:'bold', fontSize:20  }}>Kamis</Text>
                <View>{adaHari(kamis)}</View>
                <Text style={{ color:'white', fontWeight:'bold', fontSize:20  }}>Jum'ah</Text>
                <View>{adaHari(jumat)}</View>
                <Text style={{ color:'white', fontWeight:'bold', fontSize:20  }}>Sabtu</Text>
                <View>{adaHari(sabtu)}</View>
                <Text style={{ color:'white', fontWeight:'bold', fontSize:20  }}>Minggu</Text>
                <View>{adaHari(minggu)}</View>
            </View>

        )
    }

    const kuliahView = ()=>{
        return(
            <ScrollView>
            <View>
                <View style={{ padding: 10, borderRadius:12, margin:10, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Jadwal kuliah</Text>
                    </View>
                    {jadwalKuliah()}
                </View>
                <View style={{ padding: 10, borderRadius:12, margin:10, backgroundColor: 'rgba(153, 50, 204, 0.5)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'60%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Tambah Jadwal kuliah</Text>
                    </View>
                    <Text style={{ color:'white', fontWeight:'bold' }}>Nama Mata Kuliah</Text>
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
                    </View>
                </View>
            </View>
        )
    }

    const ada=()=>{
        return(
            <View>
            <FlatList
                data={todo}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => renderTodo(item)}
            />
        </View>
        )
    }

    const todoView = ()=>{
        return(
            <View>
                {todo.length>0?ada():kosong()}
            </View>
        )
    }

    return (
        <SafeAreaView>
            <ImageBackground source={require('../images/bg-1.jpg')}  style={{ width:'100%', height:'100%' }}>
                <View style={{ flexDirection:'row', padding:20, justifyContent:'center', backgroundColor: 'rgba(153, 50, 204, 0.9)', borderRadius:12, margin:15, borderColor:'white', borderWidth:2 }}>
                    <TouchableOpacity onPress={()=>{setKuliah(true)}}>
                        <View style={{ backgroundColor:kuliah?'rgba(0, 206, 209,1)':'rgba(0, 206, 209,0.1)', borderRadius:15, height:40, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'white', borderWidth:2, margin:10, width:150 }}>
                            <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Jadwal Kuliah</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{setKuliah(false)}}>
                        <View style={{ backgroundColor:!kuliah?'rgba(0, 206, 209,1)':'rgba(0, 206, 209,0.1)', borderRadius:15, height:40, padding:5, justifyContent:'center', flexDirection:'row', borderColor:'white', borderWidth:2, margin:10, width:150 }}>
                            <Text style={{ marginRight:5, fontSize:15, color:'white' }}>Todo List</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {kuliah?kuliahView():todoView()}
            </ImageBackground>
        </SafeAreaView>
    );
}

export default Kuliah;