import { View, Text } from 'native-base'
import * as React from 'react';
import { useState, useEffect } from "react";
import { ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import SQLite from 'react-native-sqlite-storage';
import PTRView from 'react-native-pull-to-refresh';
import { ScrollView } from 'react-native-gesture-handler';
import StickyParallaxHeader from 'react-native-sticky-parallax-header'

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

const Home = () => {

    const [todo, setTodo] = useState([]);
    const [tugas, setTugas] = useState([]);
    const [jadwal, setJadwal] = useState([]);
    useEffect(() => {
        refresh();
    }, [])

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

        var today = new Date();
        var tgl = today.getDate();
        var bln = today.getMonth()+1;
        var thn = today.getFullYear();
        var today = tgl+'-'+bln+'-'+thn;
    const refresh = ()=>{
        getAllTodo();
        getAllTugas();
        getAllJadwal();
    }
    const getAllTodo = async ()=>{
        let selectQuery = await ExecuteQuery("SELECT * FROM todo WHERE status = 0 AND waktu = ?",[today]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setTodo(temp);
    }

    const getAllTugas = async ()=>{
        let selectQuery = await ExecuteQuery("SELECT tugas.*, matkul.nama FROM tugas INNER JOIN matkul ON matkul.id = tugas.matkul_id WHERE status = 0 AND deadline = ?",[today]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setTugas(temp);
    }

    const getAllJadwal = async ()=>{
        var today = new Date();
        var hari = today.getDay();
        let selectQuery = await ExecuteQuery("SELECT * FROM matkul WHERE hari = ?",[hari]);
        var rows = selectQuery.rows;
        var temp = [];
        for (let i = 0; i < rows.length; i++) {
            var item = rows.item(i);
            temp.push(item);
        }
        setJadwal(temp);
    }
    

    const todoView = ()=>{
        return(
            todo.map((item)=>
            <View key={item.id}>
                <Text style={{ fontWeight:'bold', fontSize:20, color:'white' }}>- {item.judul}</Text>
            </View>
            )
        )
    }

    const tugasView = ()=>{
        return(
            tugas.map((item)=>
            <View key={item.id}>
                <Text style={{ fontWeight:'bold', fontSize:20, color:'white' }}>- {item.nama} (Tengat: {item.deadline})</Text>
            </View>
            )
        )
    }

    const jadwalView = ()=>{
        return(
            jadwal.map((item)=>
            <View key={item.id} style={{ padding:3, margin:5, flexDirection:'row' }}>
            <View style={{ width:'50%' }}>
                <Text style={{ color:'white', fontSize:20, fontWeight:'bold', marginLeft:10  }}>- {item.nama} </Text>
            </View>
            <View style={{ width:'50%' }}>
                <Text style={{ color:'white', fontSize:20, fontWeight:'bold' }}>{item.jam_mulai} - {item.jam_akhir} </Text>
            </View>
        </View>
            )
        )
    }

    const itemView = ()=>{
        return(
            <View>
                <ScrollView>
            <View style={{ padding: 10, borderRadius:12, margin:15, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                    <Text style={{ color:'white' }}>Tugas</Text>
                </View>
                <View style={{ position:'relative', top:-20 }}>
                    {tugas.length>0?tugasView():<Text style={{ color:'white', fontSize:20 }}> Tidak ada tugas!</Text>}
                </View>
            </View>
            <View style={{ padding: 10, borderRadius:12, margin:15, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                    <Text style={{ color:'white' }}>Todo Hari ini</Text>
                </View>
                <View style={{ position:'relative', top:-20 }}>
                    {todo.length>0?todoView():<Text style={{ color:'white', fontSize:20 }}> Tidak ada ToDo!</Text>}
                </View>
            </View>
            <View style={{ padding: 10, borderRadius:12, margin:15, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                    <Text style={{ color:'white' }}>Jadwal Hari ini</Text>
                </View>
                <View style={{ position:'relative', top:-20 }}>
                    {jadwal.length>0?jadwalView():<Text style={{ color:'white', fontSize:20 }}> Kosong!</Text>}
                </View>
            </View>
            </ScrollView>
            </View>
        )
    }

    return (
        <SafeAreaView>
            <ImageBackground source={require('../images/bg-1.jpg')} style={{ width:'100%', height:'100%' }}>
                <PTRView onRefresh={_refresh} >
                <View style={{ height:90, justifyContent:'center', marginVertical:15, padding:10 }}>
                    <Text style={{ color:'white', fontSize:30, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 5}, textShadowRadius: 15 }}>Apa Yang Saya</Text>
                    <Text style={{ color:'white', fontSize:30, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 5}, textShadowRadius: 15 }}>Lakukan Hari ini!</Text>
                    <Text style={{ color:'white', fontSize:15, fontFamily:'sans-serif', fontWeight:'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 2}, textShadowRadius: 10 }}>Awali aktivitasmu dengan ber do'a</Text>
                </View>
                <View style={{ borderBottomColor: 'white', borderBottomWidth: 1, width:'75%', marginBottom:15}}/>
                {itemView()}
        </PTRView>
            </ImageBackground>

        </SafeAreaView>
    )
}

export default Home
