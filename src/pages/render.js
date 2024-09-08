const btn1=document.getElementById("btn1");
const div1=document.getElementById("div1");
const pageInput=document.getElementById("page-input");
const pageSizeInput=document.getElementById('page-size-input');

btn1.onclick=async function(){
    const page=parseInt(pageInput.value);
    const pageSize=parseInt(pageSizeInput.value);
    const res=await databaseApi.getAll(page,pageSize);
    div1.innerText=JSON.stringify(res);
}


// const btn2=document.getElementById("btn2");
// const nameInput=document.getElementById("name-input");
// const ageInput=document.getElementById("age-input");
// const div2=document.getElementById("div2");

// btn2.onclick=async function(){
//     const name=nameInput.value;
//     const age=parseInt(ageInput.value);
//     const id=await databaseApi.insert(name,age);
    
//     div2.innerText=id;
// }


// const btn3=document.getElementById("btn3");
// const idInput=document.getElementById("id-input");

// btn3.onclick=async function(){
//     await databaseApi.delete(parseInt(idInput.value));
// }

// const btn4=document.getElementById('btn4');
// const ageInput2=document.getElementById("age-input2");
// const ageIdInput=document.getElementById("age-id-input");

// btn4.onclick=async function(){
//     await databaseApi.updateAge(parseInt(ageIdInput.value),parseInt(ageInput2.value));
// }


const queryInput=document.getElementById("query-input");
const runBtn=document.getElementById("run-btn");
const runDiv=document.getElementById('run-div');

queryInput.style="width:15%; height:50px";
runBtn.onclick=async function(){
    const res=await databaseApi.run(queryInput.value);
    runDiv.innerText=res;
}


const opInput=document.getElementById('op-input');
const contentInput=document.getElementById('content-input');
const sendBtn=document.getElementById("send-btn");
const dataDiv=document.getElementById("data-div");

sendBtn.onclick=async()=>{
    const op=parseInt(opInput.value);
    const content=parseInt(contentInput.value);
    const res=await portApi.send(op,content);
    console.log(res);
    
    dataDiv.innerText=`currentData: ${res}`;
}