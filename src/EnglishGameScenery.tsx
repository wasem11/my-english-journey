import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {NeighborhoodPlace} from './neighborhood';
export const gameEnvironments:Record<string,{ground:string;edge:string;path:string;trim:string;name:string}>={
 'community-shops':{ground:'#DFE8CB',edge:'#B0C297',path:'#F8EDCE',trim:'#C7BEA2',name:'Shops & café'},
 'community-library':{ground:'#E5D8BE',edge:'#C0AC8D',path:'#FAEDD3',trim:'#D1BC96',name:'Library & activities'},
 'community-town':{ground:'#D8E5DC',edge:'#A8C0B3',path:'#91A5A0',trim:'#C2CFC5',name:'Around town'},
 'school-gates':{ground:'#D6E5BB',edge:'#A2C188',path:'#EFE2B5',trim:'#C7B88C',name:'Meet the parents'},
 'playdate-park':{ground:'#E5DDAF',edge:'#B9C28A',path:'#F8E9C5',trim:'#D1BA8A',name:'Playdates & invitations'},
 'school-community':{ground:'#D0E2DC',edge:'#9CBFB3',path:'#F2E7CC',trim:'#BDB69D',name:'School conversations'},
 'friendly-neighbors':{ground:'#E8D5C3',edge:'#C7AF8E',path:'#F8EADB',trim:'#D0B89D',name:'Neighbors & new friends'},
 'care-center':{ground:'#CEE4DF',edge:'#9DBFB8',path:'#F4F4DE',trim:'#BBCCBF',name:'Everyday appointments'},
 preschool:{ground:'#DCEABD',edge:'#A9C882',path:'#F3D99C',trim:'#C7A665',name:'Playground'},
 school:{ground:'#E5D3AE',edge:'#C2A47C',path:'#F6EACA',trim:'#C5AD83',name:'School day'},
 market:{ground:'#E0E9CD',edge:'#A9C38F',path:'#F7F1DF',trim:'#C9D0B4',name:'Market street'},
 cafe:{ground:'#E8CDBA',edge:'#C59A80',path:'#F4E5CE',trim:'#CDB395',name:'Café terrace'},
 clinic:{ground:'#D7E8E1',edge:'#A6C7BD',path:'#F4F8EC',trim:'#C5D9CE',name:'Family clinic'},
 library:{ground:'#DDC9A9',edge:'#B59A78',path:'#F6E6C6',trim:'#C8AE88',name:'Library rooms'},
 park:{ground:'#C6DEA3',edge:'#83AC75',path:'#EDD59F',trim:'#C5AC78',name:'Park trails'},
 home:{ground:'#E9D5BE',edge:'#C6AB8F',path:'#FBEDD6',trim:'#D5BFA1',name:'Home & family'},
 transit:{ground:'#D0DFCF',edge:'#A1B8A0',path:'#7D9290',trim:'#BECBBE',name:'Around town'},
 community:{ground:'#DCDCB9',edge:'#B7BB89',path:'#F7E8C7',trim:'#D3C49F',name:'Community garden'},
};
function Plant(){return <View style={s.plant}><View style={s.leaves}/><View style={s.leafSide}/><View style={s.pot}/></View>;}
function Tree(){return <View style={s.tree}><View style={s.treeShadow}/><View style={s.trunk}/><View style={s.crown}/><View style={s.crownLight}/></View>;}
function Books(){return <View style={s.shelf}>{[0,1,2].map(row=><View key={row} style={s.bookRow}>{['#769D88','#DCA66B','#97ABB7','#C77C68','#D7C780'].map((color,i)=><View key={i} style={{width:11,height:20+(i%2)*5,backgroundColor:color,borderRadius:2,marginHorizontal:1}}/>)}</View>)}</View>;}
function Table({cafe=false}:{cafe?:boolean}){return <View style={s.tableScene}><View style={s.chairLeft}/><View style={s.chairRight}/><View style={[s.table,cafe&&{borderRadius:45}]}><Ionicons name={cafe?'cafe':'book'} size={24} color="#785B43"/></View><View style={s.tableBase}/></View>;}
function Playground(){return <View style={s.playground}><View style={s.tower}/><View style={s.towerRoof}/><View style={s.slide}/><View style={s.ladder}/><View style={s.sand}/></View>;}
function Market(){return <View style={s.market}><View style={s.awning}>{[0,1,2,3,4].map(i=><View key={i} style={{flex:1,backgroundColor:i%2?'#F9EBD1':'#668C5B'}}/>)}</View><View style={s.crate}>{['#DD9659','#CF6855','#9AAD69','#DD9659','#D6B758','#CF6855'].map((c,i)=><View key={i} style={{width:21,height:22,borderRadius:12,backgroundColor:c,margin:1}}/>)}</View><View style={s.counter}/></View>;}
function Chalkboard(){return <View style={s.board}><View style={s.chalkLine}/><View style={[s.chalkLine,{width:42,marginTop:7}]}/><Text style={s.chalkABC}>A B C</Text><View style={s.boardLeg}/><View style={[s.boardLeg,{left:76}]}/></View>;}
function Sofa(){return <View style={s.sofa}><View style={s.sofaBack}/><View style={s.cushions}><View style={s.cushion}/><View style={[s.cushion,{backgroundColor:'#DAB99C'}]}/></View><View style={s.sofaSeat}/><View style={s.sofaArm}/><View style={[s.sofaArm,{left:94}]}/></View>;}
function Bus(){return <View style={s.bus}><View style={s.busWindows}>{[0,1,2].map(i=><View key={i} style={s.busWindow}/>)}</View><View style={s.busStripe}/><View style={s.wheel}/><View style={[s.wheel,{left:88}]}/></View>;}
function Clinic(){return <View style={s.clinic}><View style={s.clinicDesk}/><View style={s.cross}><Ionicons name="add" size={32} color="#FDF8EF"/></View><View style={s.clinicChair}/><View style={[s.clinicChair,{left:73}]}/></View>;}
function Noticeboard(){return <View style={s.noticeboard}>{['#E7C97A','#D39E89','#AFC4A1'].map((c,i)=><View key={i} style={[s.notice,{left:9+i*27,backgroundColor:c,transform:[{rotate:`${i%2?8:-5}deg`}]}]}/>)}<View style={s.boardLeg}/><View style={[s.boardLeg,{left:76}]}/></View>;}
export default function EnglishGameScenery({place,index,side}:{place:NeighborhoodPlace;index:number;side:'left'|'right'}){
 let object:React.ReactNode;
 switch(place.id){
  case 'community-shops':object=index%2?<Table cafe/>:<Market/>;break;
  case 'community-library':object=index%2?<Books/>:<Table/>;break;
  case 'community-town':object=index%2?<Bus/>:<Tree/>;break;
  case 'school-gates':object=index%2?<Chalkboard/>:<Tree/>;break;
  case 'playdate-park':object=index%2?<Playground/>:<Tree/>;break;
  case 'school-community':object=index%2?<Noticeboard/>:<Chalkboard/>;break;
  case 'friendly-neighbors':object=index%2?<Plant/>:<Sofa/>;break;
  case 'care-center':object=index%2?<Market/>:<Clinic/>;break;
  case 'preschool':object=index%2?<Chalkboard/>:<Playground/>;break;
  case 'school':object=index%2?<Table/>:<Chalkboard/>;break;
  case 'market':object=index%2?<Plant/>:<Market/>;break;
  case 'cafe':object=index%2?<Plant/>:<Table cafe/>;break;
  case 'clinic':object=index%2?<Plant/>:<Clinic/>;break;
  case 'library':object=index%2?<Table/>:<Books/>;break;
  case 'park':object=index%2?<View style={s.pond}><View style={s.ripple}/></View>:<Tree/>;break;
  case 'home':object=index%2?<Plant/>:<Sofa/>;break;
  case 'transit':object=index%2?<View style={s.busStop}><Ionicons name="bus-outline" size={28} color="#285B50"/></View>:<Bus/>;break;
  default:object=index%2?<Plant/>:<Noticeboard/>;
 }
 return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.object,{transform:[{rotate:side==='left'?'-7deg':'7deg'},{scale:index%2?.86:1}]}]}>{object}</View>;
}
const s=StyleSheet.create({
 object:{width:120,height:120,alignItems:'center',justifyContent:'center'},plant:{width:70,height:100,alignItems:'center'},pot:{position:'absolute',bottom:5,width:35,height:34,borderBottomLeftRadius:12,borderBottomRightRadius:12,backgroundColor:'#BD8866',borderTopWidth:5,borderColor:'#D9AB84'},leaves:{position:'absolute',top:4,width:39,height:62,backgroundColor:'#67936B',borderTopLeftRadius:35,borderBottomRightRadius:35,transform:[{rotate:'-20deg'}]},leafSide:{position:'absolute',top:24,left:6,width:36,height:45,backgroundColor:'#8AB17A',borderTopRightRadius:35,borderBottomLeftRadius:35,transform:[{rotate:'20deg'}]},tree:{width:112,height:120,alignItems:'center'},treeShadow:{position:'absolute',bottom:0,width:91,height:24,borderRadius:50,backgroundColor:'#52744B25'},trunk:{position:'absolute',bottom:6,width:17,height:64,backgroundColor:'#99734E',borderRadius:6},crown:{position:'absolute',top:0,width:97,height:86,borderRadius:42,backgroundColor:'#588960',borderBottomWidth:9,borderColor:'#48774C'},crownLight:{position:'absolute',top:4,left:17,width:61,height:56,borderRadius:34,backgroundColor:'#80AC70'},shelf:{width:100,height:105,backgroundColor:'#977454',borderWidth:7,borderColor:'#B38C64',borderRadius:5},bookRow:{height:29,flexDirection:'row',alignItems:'flex-end',borderBottomWidth:4,borderColor:'#B38C64'},tableScene:{width:116,height:108},table:{position:'absolute',top:17,left:17,width:82,height:66,backgroundColor:'#DAB482',borderRadius:12,borderBottomWidth:8,borderColor:'#BE925F',alignItems:'center',justifyContent:'center',zIndex:2},tableBase:{position:'absolute',top:80,left:52,width:14,height:22,backgroundColor:'#937153',borderRadius:3},chairLeft:{position:'absolute',left:0,top:37,width:26,height:38,borderRadius:8,backgroundColor:'#789A86',borderBottomWidth:6,borderColor:'#507363'},chairRight:{position:'absolute',right:0,top:37,width:26,height:38,borderRadius:8,backgroundColor:'#789A86',borderBottomWidth:6,borderColor:'#507363'},playground:{width:116,height:120},tower:{position:'absolute',left:17,top:26,width:42,height:62,backgroundColor:'#8BA580',borderWidth:5,borderColor:'#F3D290'},towerRoof:{position:'absolute',left:8,top:13,width:60,height:24,borderTopLeftRadius:25,borderTopRightRadius:25,backgroundColor:'#CB8F6A'},slide:{position:'absolute',left:58,top:49,width:20,height:77,borderRadius:8,backgroundColor:'#DDBF65',borderRightWidth:4,borderColor:'#F4DEA0',transform:[{rotate:'-35deg'}]},ladder:{position:'absolute',left:5,top:50,width:20,height:52,borderWidth:4,borderColor:'#8E7454'},sand:{position:'absolute',left:0,bottom:0,width:116,height:12,borderRadius:10,backgroundColor:'#C4B078'},market:{width:112,height:110},awning:{height:29,width:112,flexDirection:'row',borderTopLeftRadius:8,borderTopRightRadius:8,overflow:'hidden'},crate:{position:'absolute',top:35,left:6,width:100,height:53,backgroundColor:'#BC956A',borderWidth:4,borderColor:'#D8B588',flexDirection:'row',flexWrap:'wrap'},counter:{position:'absolute',bottom:8,left:0,width:112,height:13,borderRadius:4,backgroundColor:'#9B7654'},board:{width:104,height:78,backgroundColor:'#386E58',borderWidth:7,borderColor:'#BA956A',borderRadius:6},chalkLine:{height:3,width:64,backgroundColor:'#DFE9C4',marginTop:9,marginLeft:8,borderRadius:2},chalkABC:{color:'#F1E6B6',fontSize:14,fontWeight:'800',marginLeft:10,marginTop:6},boardLeg:{position:'absolute',left:7,bottom:-28,width:7,height:26,backgroundColor:'#A78259'},sofa:{width:116,height:100},sofaBack:{position:'absolute',left:0,top:10,width:116,height:60,borderRadius:19,backgroundColor:'#88A18D'},cushions:{position:'absolute',left:12,top:24,flexDirection:'row',gap:6},cushion:{width:39,height:32,borderRadius:9,backgroundColor:'#E4D1A5'},sofaSeat:{position:'absolute',left:8,top:57,width:100,height:23,borderRadius:7,backgroundColor:'#6F8C79',borderBottomWidth:7,borderColor:'#587460'},sofaArm:{position:'absolute',left:0,top:39,width:22,height:44,borderRadius:9,backgroundColor:'#78977F'},bus:{width:117,height:68,backgroundColor:'#789FA1',borderRadius:14,borderBottomWidth:7,borderColor:'#47787B'},busWindows:{flexDirection:'row',gap:6,margin:9},busWindow:{height:22,width:25,backgroundColor:'#D6E8DB',borderRadius:5},busStripe:{height:6,width:100,backgroundColor:'#E9D494',marginLeft:8},wheel:{position:'absolute',bottom:-14,left:13,width:22,height:22,borderRadius:12,backgroundColor:'#485C58',borderWidth:5,borderColor:'#344740'},busStop:{width:47,height:65,borderRadius:9,backgroundColor:'#F0EAD0',borderWidth:5,borderColor:'#769F89',alignItems:'center',justifyContent:'center'},clinic:{width:113,height:110},clinicDesk:{position:'absolute',left:0,top:37,width:113,height:48,borderRadius:9,backgroundColor:'#86AF9F',borderTopWidth:10,borderColor:'#EFF2DA'},cross:{position:'absolute',left:13,top:0,width:37,height:37,borderRadius:10,backgroundColor:'#C7836A',alignItems:'center',justifyContent:'center'},clinicChair:{position:'absolute',left:19,bottom:0,width:27,height:29,backgroundColor:'#6F9B9B',borderRadius:7,borderBottomWidth:6,borderColor:'#517B79'},pond:{width:116,height:79,borderRadius:50,backgroundColor:'#8DBCC1',borderWidth:9,borderColor:'#AABF8B',transform:[{rotate:'-15deg'}]},ripple:{position:'absolute',left:21,top:15,width:56,height:24,borderRadius:30,borderWidth:2,borderColor:'#C1DFD8'},noticeboard:{width:106,height:75,backgroundColor:'#D0B987',borderWidth:7,borderColor:'#9D825C',borderRadius:6},notice:{position:'absolute',top:14,width:21,height:32,borderRadius:3},
});
