const lanePositions=[.35,.62,.46,.65,.37,.56,.34,.61,.42,.62];
export function trailLayout(fontScale:number,translated:boolean,count:number){
 const scale=Math.max(1,fontScale),start=Math.ceil(155*scale),spacing=Math.ceil((translated?224:176)*scale);
 return {start,spacing,height:start+Math.max(0,count-1)*spacing+Math.ceil(250*scale)};
}
export function trailPoint(index:number,width:number,spacing=158,start=155){return {x:width*lanePositions[index%lanePositions.length],y:start+index*spacing};}
export function parkedPoint(index:number,width:number,spacing=158,start=155){const p=trailPoint(index,width,spacing,start);return {x:p.x+(p.x>width/2?-80:80),y:p.y-10};}
export function trailLabelBounds(index:number,width:number,fontScale:number){
 const labelWidth=Math.min(width-16,166*Math.max(1,fontScale)),x=trailPoint(index,width).x;
 return {width:labelWidth,left:Math.max(8,Math.min(width-labelWidth-8,x-labelWidth/2))};
}
