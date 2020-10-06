import { View, Text } from 'native-base'
import * as React from 'react';
import { useState, useEffect } from "react";
import { ImageBackground } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
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

const Home = () => {

    const [todo, setTodo] = useState([]);
    const [tugas, setTugas] = useState([]);
    useEffect(() => {
        getAllTodo();
        getAllTugas();
    }, [])

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

    return (
        <SafeAreaView>
            <ImageBackground source={require('../images/bg.png')} style={{ width:'100%', height:'100%' }}>
                <View style={{ flexDirection:'row', height:90, justifyContent:'center', marginTop:25 }}>
                    <Text style={{ color:'white', fontSize:20, fontFamily:'sans-serif', fontWeight:'100' }}>Ayo buat catatan disini!</Text>
                </View>
                <View style={{ padding: 10, borderRadius:12, margin:15, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Tugas</Text>
                    </View>
                    <View style={{ position:'relative', top:-20 }}>
                        {tugas.length>0?tugasView():<Text>Data kosong</Text>}
                    </View>
                </View>
                <View style={{ padding: 10, borderRadius:12, margin:15, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Todo Hari ini</Text>
                    </View>
                    <View style={{ position:'relative', top:-20 }}>
                        {todo.length>0?todoView():<Text>Data kosong</Text>}
                    </View>
                </View>
                <View style={{ padding: 10, borderRadius:12, margin:15, backgroundColor: 'rgba(153, 50, 204, 0.2)', borderColor:'white', borderWidth:2 }}>
                    <View style={{ position:'relative', justifyContent:'center', flexDirection:'row' ,top:-25, backgroundColor: 'rgba(153, 50, 204, 1)', padding:5, width:'40%', borderRadius:12 }}>
                        <Text style={{ color:'white' }}>Jadwal Hari ini</Text>
                    </View>
                    <View style={{ position:'relative', top:-20 }}>
                        <Text style={{ fontWeight:'bold', fontSize:20, color:'white' }}>PBO jam 11.20 - 12.30</Text>
                        <Text style={{ fontWeight:'bold', fontSize:20, color:'white' }}>PBO jam 11.20 - 12.30</Text>
                    </View>
                </View>

            </ImageBackground>
        </SafeAreaView>
    )
}

export default Home
