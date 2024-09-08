const sqlite3=require('sqlite3').verbose();
const { app }=require('electron');
const path=require('path');

class DatabaseManager{
    constructor(){
        this.db=null;
    }

    connect=(dbPath)=>{
        return new Promise((resolve,reject)=>{
            let DB_PATH = path.join(app.getAppPath(), `/config/${dbPath}`);
            if (app.isPackaged) {
                DB_PATH = path.join(path.dirname(app.getPath('exe')), `/config/${dbPath}`);
            }
            
            this.db=new sqlite3.Database(DB_PATH,err=>{
                if (err) {
                    console.error('Link database failed: ' + err.message);
                    reject(err);
                }else{
                    console.log('Link database successfully.')
                    resolve();
                }
            });

        })
    }

    close=()=>{
        if(this.db){
            this.db.close();
            console.log("Database closed");
        }
    }

    run=(query)=>{
        return new Promise((resolve,reject)=>{
            this.db.serialize(()=>{
                this.db.run(query,err=>{
                    if(err){
                        console.log(err);
                        reject(err);
                    }else{
                        resolve(true);
                    }
                })
            })
        })
    }

    selectAll=(page,pageSize)=>{
        return new Promise((resolve,reject)=>{
            this.db.serialize(()=>{
                let limit="";
                if(page && pageSize){
                    let idx=(page-1)*pageSize;
                    limit+=`limit ${idx},${pageSize}`;
                }
                const query="select * from nums "+limit;
                this.db.all(query,(err,rows)=>{
                    if(err){
                        console.log(err);
                        reject(err);
                    }else{
                        resolve(rows);
                    }
                });
            })
        })
    }

    // insert=(name,age)=>{
    //     return new Promise((resolve,reject)=>{
    //         this.db.serialize(()=>{
    //             this.db.run("insert into user (name,age) values (:name,:age)",{
    //                 ":name":name,
    //                 ":age":age
    //             },err=>{
    //                 if(err){
    //                     console.log(err);
    //                     reject(err);
    //                 }else{
    //                     this.db.get("select last_insert_rowid()",(err,row)=>{
    //                       if(err){
    //                           console.log(err);
    //                           reject(err);
    //                       }else{
    //                         resolve(row);
    //                       }
    //                     })
    //                 }
    //             })
    //         })
    //     })
    // }

    // delete=(id)=>{
    //     return new Promise((resolve,reject)=>{
    //         this.db.serialize(()=>{
    //             this.db.run("delete from user where id=:id",{
    //                 ":id":id
    //             },err=>{
    //                 if(err){
    //                     console.log(err);
    //                     reject(err);
    //                 }else{
    //                     resolve();
    //                 }
    //             })
    //         })
    //     })
    // }

    // updateAge=(id,age)=>{
    //     return new Promise((resolve,reject)=>{
    //         this.db.serialize(()=>{
    //             this.db.serialize(()=>{
    //                 this.db.run("update user set age=:age where id=:id;",{
    //                     ":age":age,
    //                     ":id":id
    //                 },err=>{
    //                     if(err){
    //                         console.log(err);
    //                         reject(err);
    //                     }else{
    //                         resolve();
    //                     }
    //                 })
    //             })
    //         })
    //     })
    // }

}

module.exports=DatabaseManager;