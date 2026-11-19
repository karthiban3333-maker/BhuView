import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
const { Map: MapLibreMap, Popup } = maplibregl as any;
type MapLibreMap = any;
type GeoJSONSource = any;
type MapLayerMouseEvent = any;
type MapMouseEvent = any;
import 'maplibre-gl/dist/maplibre-gl.css';
import { Compass, LocateFixed, Minus, Plus, Ruler, Box, Map as MapIcon, Globe2, Moon, Sun } from 'lucide-react';

export type MapParcel = {
  id: string; ulpin: string; survey: string; village: string; taluk: string; owner: string;
  area: string; landUse: string; risk: 'Low' | 'Medium' | 'High'; geometry?: {type:'Polygon';coordinates:number[][][]};
  areaMismatch?: boolean; openEncumbrance?: boolean; activeDispute?: boolean; floodZone?: boolean;
  zoningConflict?: boolean; boundaryOverlap?: boolean; sameOwnerConflict?: boolean; openApplication?:boolean; priorityScore?: number; updatedYear?: number;
};
export type MapMode = 'NORMAL'|'RISK'|'OWNERSHIP CONFLICT'|'BOUNDARY CONFLICT'|'LAND USE'|'ZONING'|'APPLICATIONS'|'AI ALERTS';
export type MapStyle = 'satellite' | 'standard' | 'dark';

type Props = { parcels:MapParcel[]; selected:MapParcel; onSelect?:(parcel:MapParcel)=>void; layerVisibility?:Record<string,boolean>; opacity?:number; mode?:MapMode; mapStyle?:MapStyle; measure?:boolean; simulation?:boolean; preset?:'overview'|'parcel'|'gis'|'conflicts'|'sandbox'; };
type Feature = {type:'Feature';id?:string|number;properties:Record<string,string|number|boolean|null>;geometry:{type:'Polygon'|'LineString'|'Point';coordinates:number[][][]|number[][]|number[]}};
type FeatureCollection = {type:'FeatureCollection';features:Feature[]};
const emptyCollection:FeatureCollection={type:'FeatureCollection',features:[]};
const layerIds:Record<string,string>={
  'Cadastral parcels':'parcel-extrusion',Roads:'context-roads',Buildings:'context-buildings','Land use':'context-land-use',Zoning:'context-zoning','Water bodies':'context-water',Utilities:'context-utilities','Environmental restrictions':'context-environment','Administrative boundaries':'context-boundaries','Risk areas':'context-risk','AI alerts':'context-alerts',Applications:'context-applications',Disputes:'context-disputes',parcels:'parcel-extrusion',utilities:'context-utilities',zoning:'context-zoning','flood-risk':'context-risk'
};
const num = (value:number|undefined, fallback:number) => Number.isFinite(value)?Number(value):fallback;
function centerOf(p:MapParcel):[number,number] { const ring=p.geometry?.coordinates?.[0]||[]; if(!ring.length)return [80.2,12.85]; const pts=ring.slice(0,-1); return [pts.reduce((a,b)=>a+b[0],0)/pts.length,pts.reduce((a,b)=>a+b[1],0)/pts.length]; }
const motionDuration=(duration:number)=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:duration;
function polygonFeature(p:MapParcel, selected:string, mode:MapMode):Feature|null { const ring=p.geometry?.coordinates?.[0]; if(!ring||ring.length<4)return null; return {type:'Feature',id:p.id,properties:{id:p.id,risk:p.risk,selected:p.id===selected,priority_score:num(p.priorityScore,p.risk==='High'?30:p.risk==='Medium'?15:5),updated_year:num(p.updatedYear,2026),area_mismatch:!!p.areaMismatch,open_encumbrance:!!p.openEncumbrance,active_dispute:!!p.activeDispute,flood_zone:!!p.floodZone,zoning_conflict:!!p.zoningConflict,boundary_overlap:!!p.boundaryOverlap,same_owner_conflict:!!p.sameOwnerConflict,application_open:!!p.openApplication},geometry:{type:'Polygon',coordinates:p.geometry!.coordinates}}; }
function makeContext(parcels:MapParcel[]):FeatureCollection {
 const features:Feature[]=[];const administrative=new Map<string,number[][]>();
 const scaled=(ring:number[][],factor:number)=>{const center=centerOf({geometry:{type:'Polygon',coordinates:[ring]}} as MapParcel);return ring.map(point=>[center[0]+(point[0]-center[0])*factor,center[1]+(point[1]-center[1])*factor]);};
 for(const parcel of parcels){
  const ring=parcel.geometry?.coordinates?.[0];if(!ring||ring.length<4)continue;
  const common={id:parcel.id,risk:parcel.risk,land_use:parcel.landUse,area_mismatch:!!parcel.areaMismatch,open_encumbrance:!!parcel.openEncumbrance,active_dispute:!!parcel.activeDispute,flood_zone:!!parcel.floodZone,zoning_conflict:!!parcel.zoningConflict,boundary_overlap:!!parcel.boundaryOverlap,application_open:!!parcel.openApplication,source:'SYNTHETIC CONTEXT · DERIVED FROM DEMO PARCEL GEOMETRY'};
  const center=centerOf(parcel);const scaledRing=scaled(ring,.54);
  features.push({type:'Feature',properties:{...common,kind:'boundary'},geometry:{type:'LineString',coordinates:ring}});
  features.push({type:'Feature',properties:{...common,kind:'land-use'},geometry:{type:'Polygon',coordinates:parcel.geometry!.coordinates}});
  features.push({type:'Feature',properties:{...common,kind:'zoning'},geometry:{type:'Polygon',coordinates:parcel.geometry!.coordinates}});
  features.push({type:'Feature',properties:{...common,kind:'risk'},geometry:{type:'Polygon',coordinates:parcel.geometry!.coordinates}});
  features.push({type:'Feature',properties:{...common,kind:'road'},geometry:{type:'LineString',coordinates:[ring[0],center,ring[Math.floor(ring.length/2)]]}});
  features.push({type:'Feature',properties:{...common,kind:'building'},geometry:{type:'Polygon',coordinates:[scaledRing]}});
  features.push({type:'Feature',properties:{...common,kind:'utility'},geometry:{type:'LineString',coordinates:[ring[1],center,ring[ring.length-2]]}});
  if(parcel.floodZone)features.push({type:'Feature',properties:{...common,kind:'water',context_label:'Synthetic flood-zone envelope'},geometry:{type:'Polygon',coordinates:parcel.geometry!.coordinates}});
  if(parcel.floodZone||parcel.activeDispute)features.push({type:'Feature',properties:{...common,kind:'environment',context_label:'Potential restriction requires verification'},geometry:{type:'Polygon',coordinates:parcel.geometry!.coordinates}});
  const group=administrative.get(parcel.village)||[];group.push(...ring);administrative.set(parcel.village,group);
  if(parcel.areaMismatch||parcel.openEncumbrance||parcel.activeDispute||parcel.zoningConflict)features.push({type:'Feature',properties:{...common,kind:'alert'},geometry:{type:'Point',coordinates:center}});
  if(parcel.openApplication)features.push({type:'Feature',properties:{...common,kind:'application'},geometry:{type:'Point',coordinates:center}});
  if(parcel.activeDispute)features.push({type:'Feature',properties:{...common,kind:'dispute'},geometry:{type:'Point',coordinates:center}});
 }
 for(const [village,points] of administrative){if(!points.length)continue;const xs=points.map(point=>point[0]),ys=points.map(point=>point[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);features.push({type:'Feature',properties:{id:village,kind:'administrative-boundary',source:'SYNTHETIC VILLAGE ENVELOPE · NOT AN OFFICIAL BOUNDARY'},geometry:{type:'LineString',coordinates:[[minX,minY],[maxX,minY],[maxX,maxY],[minX,maxY],[minX,minY]]}});}
 return {type:'FeatureCollection',features};
}
function distanceKm(points:[number,number][]) {let total=0;for(let i=1;i<points.length;i++){const [lon1,lat1]=points[i-1],[lon2,lat2]=points[i];const r=6371,rad=Math.PI/180,dLat=(lat2-lat1)*rad,dLon=(lon2-lon1)*rad;const a=Math.sin(dLat/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin(dLon/2)**2;total+=2*r*Math.asin(Math.sqrt(a));}return total;}
function ringAreaSqKm(points:[number,number][]) {if(points.length<3)return 0;const lat=points.reduce((a,p)=>a+p[1],0)/points.length,scale=111.32*Math.cos(lat*Math.PI/180),ys=110.574;let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=(a[0]*scale)*(b[1]*ys)-(b[0]*scale)*(a[1]*ys);}return Math.abs(area/2);}
function CadastralFallback({parcels,selected,onSelect,zoom=1,focusSelected=false}:{parcels:MapParcel[];selected:MapParcel;onSelect?:(parcel:MapParcel)=>void;zoom?:number;focusSelected?:boolean}){const coords=parcels.flatMap(p=>p.geometry?.coordinates?.[0]||[]);if(!coords.length)return <div className="cadastral-fallback-empty">No parcel geometry is available.</div>;const selectedRing=focusSelected?selected.geometry?.coordinates?.[0]:undefined;const extent=selectedRing?.length?selectedRing:coords;const xs=extent.map(p=>p[0]),ys=extent.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const point=(p:number[])=>{let x=40+(p[0]-minX)/(maxX-minX||1)*920,y=580-(p[1]-minY)/(maxY-minY||1)*540;if(!focusSelected){x=500+(x-500)*zoom;y=310+(y-310)*zoom}return `${x},${y}`};return <svg className="cadastral-fallback" viewBox="0 0 1000 620" role="img" aria-label={`Cadastral fallback map showing ${parcels.length} parcel boundaries`}><title>Parcel geometry fallback</title><desc>Keyboard-selectable cadastral polygons derived from backend GeoJSON. Zoom and focus controls remain available.</desc>{parcels.map(parcel=>{const ring=parcel.geometry?.coordinates?.[0];if(!ring||ring.length<4)return null;const isSelected=parcel.id===selected.id;return <g key={parcel.id} role="button" tabIndex={0} aria-label={`${parcel.id}, ${parcel.village}, ${parcel.risk} risk`} onClick={()=>onSelect?.(parcel)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect?.(parcel)}}}><polygon points={ring.map(point).join(' ')} fill={isSelected?'#007aff88':parcel.risk==='High'?'#ff3b3066':parcel.risk==='Medium'?'#ff950066':'#007aff33'} stroke={isSelected?'#007aff':'#8e8e93'} strokeWidth={isSelected?3:1.2}/>{isSelected&&<text x={point(ring[0]).split(',')[0]} y={point(ring[0]).split(',')[1]} fill="#1c1c1e" fontSize="12" fontWeight="600">{parcel.id} · {parcel.risk}</text>}</g>})}</svg>}
export function GeoMap({parcels,selected,onSelect,layerVisibility={},opacity=78,mode='RISK',mapStyle:initialMapStyle='satellite',measure=false,simulation=false,preset='overview'}:Props){
 const hostRef=useRef<HTMLDivElement>(null), mapRef=useRef<MapLibreMap|null>(null), loadedRef=useRef(false), readyRef=useRef(false), is3dRef=useRef(true), parcelRef=useRef(parcels), selectedRef=useRef(selected), previousSelectedIdRef=useRef(selected.id), callbackRef=useRef(onSelect), layersRef=useRef(layerVisibility), modeRef=useRef(mode), measureRef=useRef(measure), opacityRef=useRef(opacity), pointsRef=useRef<[number,number][]>([]);
 const [mapError,setMapError]=useState(''),[is3d,setIs3d]=useState(true),[mapStyle,setMapStyle]=useState<MapStyle>(initialMapStyle),[measurePoints,setMeasurePoints]=useState<[number,number][]>([]),[webgl,setWebgl]=useState(true),[mapReady,setMapReady]=useState(false),[fallbackZoom,setFallbackZoom]=useState(1),[fallbackFocus,setFallbackFocus]=useState(false);
 parcelRef.current=parcels;selectedRef.current=selected;callbackRef.current=onSelect;is3dRef.current=is3d;layersRef.current=layerVisibility;modeRef.current=mode;measureRef.current=measure;opacityRef.current=opacity;
 const parcelData=useMemo<FeatureCollection>(()=>({type:'FeatureCollection',features:parcels.map(p=>polygonFeature(p,selected.id,mode)).filter((f):f is Feature=>f!==null)}),[parcels,selected.id,mode]);
 const contextData=useMemo(()=>makeContext(parcels),[parcels]);
 const syncLayerVisibility=useCallback((map:MapLibreMap)=>{for(const [key,id] of Object.entries(layerIds)){if(map.getLayer(id)&&layersRef.current[key]!==undefined)map.setLayoutProperty(id,'visibility',layersRef.current[key]?'visible':'none');}},[]);
 useEffect(()=>{if(!hostRef.current||mapRef.current)return;setMapError('');
  let map:MapLibreMap;let disposed=false;let fallbackTimer=0;readyRef.current=false;setMapReady(false);
  try{
    map=new MapLibreMap({
      container:hostRef.current,
      style:{
        version:8,
        sources:{
          'satellite-tiles': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Esri World Imagery Satellite'
          }
        },
        layers:[
          {id:'atlas-background',type:'background',paint:{'background-color':mapStyle==='dark'?'#1c1c1e':mapStyle==='satellite'?'#0a0f16':'#f2f2f7'}},
          {id:'satellite-layer',type:'raster',source:'satellite-tiles',paint:{'raster-opacity':0.92},layout:{visibility:mapStyle==='satellite'?'visible':'none'}}
        ]
      },
      center:[80.20,12.85],
      zoom:14.6,
      pitch:58,
      bearing:-18,
      maxPitch:75
    });
  }catch{setWebgl(false);setMapError('WebGL is unavailable. The data list remains available; this map needs a WebGL-capable browser.');return;}
  mapRef.current=map;fallbackTimer=window.setTimeout(()=>{if(!map.isStyleLoaded()){console.warn('[BhuView] Map style did not finish loading; using the accessible parcel fallback.');setMapError('Interactive map did not finish loading; showing the parcel geometry fallback.');setWebgl(false);loadedRef.current=false;disposed=true;map.remove();mapRef.current=null;}},8000);
  map.on('error',(event: any)=>{if(event.error?.message?.toLowerCase().includes('webgl')){setWebgl(false);setMapError('WebGL rendering is unavailable; use the parcel list below.');}else if(event.error?.message){console.error('[BhuView MapLibre]',event.error.message);setMapError(`Map layer warning: ${String(event.error.message).slice(0,140)}. Backend parcel geometry remains available.`);}});
  map.on('load',()=>{loadedRef.current=true;
   map.addSource('parcels',{type:'geojson',data:parcelData as never});map.addSource('context',{type:'geojson',data:contextData as never});map.addSource('measurements',{type:'geojson',data:emptyCollection as never});
   map.addLayer({id:'parcel-extrusion',type:'fill-extrusion',source:'parcels',paint:{'fill-extrusion-color':['case',['boolean',['get','selected'],false],'#007aff',['==',['get','risk'],'High'],'#ff3b30',['==',['get','risk'],'Medium'],'#ff9500','#34c759'],'fill-extrusion-height':['case',['boolean',['get','selected'],false],['+', ['get','priority_score'],55],['*',['get','priority_score'],2.4]],'fill-extrusion-base':0,'fill-extrusion-opacity':opacityRef.current/100,'fill-extrusion-vertical-gradient':true}});
   map.addLayer({id:'parcel-glow',type:'line',source:'parcels',paint:{'line-color':['case',['boolean',['get','selected'],false],'#ffffff','#007aff'],'line-width':['case',['boolean',['get','selected'],false],4,2],'line-opacity':0.35}});
   map.addLayer({id:'parcel-outline',type:'line',source:'parcels',paint:{'line-color':['case',['boolean',['get','selected'],false],'#ffffff',['==',['get','risk'],'High'],'#ff3b30','#007aff'],'line-width':['case',['boolean',['get','selected'],false],2.5,1.5],'line-dasharray':simulation?[2,2]:[1,0]}});
   const add=(id:string,type:'fill'|'line'|'circle',filter:unknown[],paint:Record<string,unknown>,before='parcel-glow')=>map.addLayer({id,type,source:'context',filter:filter as never,paint:paint as never} as never,map.getLayer(before)?before:undefined);
   add('context-roads','line',['==',['get','kind'],'road'],{'line-color':'#8e8e93','line-width':2,'line-opacity':.6});
   add('context-buildings','fill',['==',['get','kind'],'building'],{'fill-color':'#007aff','fill-opacity':.35,'fill-outline-color':'#ffffff'});
   add('context-land-use','fill',['==',['get','kind'],'land-use'],{'fill-color':['match',['get','risk'],'High','#ff3b30','Medium','#ff9500','#34c759'],'fill-opacity':.12});
   add('context-zoning','fill',['==',['get','kind'],'zoning'],{'fill-color':'#af52de','fill-opacity':.08,'fill-outline-color':'#af52de'});
   add('context-water','fill',['==',['get','kind'],'water'],{'fill-color':'#007aff','fill-opacity':.35,'fill-outline-color':'#58a6ff'});
   add('context-utilities','line',['==',['get','kind'],'utility'],{'line-color':'#ff9500','line-width':2,'line-dasharray':[2,2]});
   add('context-environment','fill',['==',['get','kind'],'environment'],{'fill-color':'#ff9500','fill-opacity':.2,'fill-outline-color':'#ff9500'});
   add('context-boundaries','line',['==',['get','kind'],'administrative-boundary'],{'line-color':'#8e8e93','line-width':1,'line-opacity':.5});
   add('context-risk','fill',['==',['get','kind'],'risk'],{'fill-color':['match',['get','risk'],'High','#ff3b30','Medium','#ff9500','#34c759'],'fill-opacity':.16});
   add('context-alerts','circle',['==',['get','kind'],'alert'],{'circle-radius':5,'circle-color':'#ff3b30','circle-stroke-width':1.5,'circle-stroke-color':'#ffffff','circle-opacity':.9});
   add('context-applications','circle',['==',['get','kind'],'application'],{'circle-radius':4.5,'circle-color':'#ff9500','circle-stroke-width':1.5,'circle-stroke-color':'#ffffff'});
   add('context-disputes','circle',['==',['get','kind'],'dispute'],{'circle-radius':4.5,'circle-color':'#af52de','circle-stroke-width':1.5,'circle-stroke-color':'#ffffff'});
   map.addLayer({id:'measure-line',type:'line',source:'measurements',paint:{'line-color':'#007aff','line-width':3,'line-dasharray':[2,1]}});
   map.addLayer({id:'measure-points',type:'circle',source:'measurements',paint:{'circle-radius':6,'circle-color':'#ffffff','circle-stroke-color':'#007aff','circle-stroke-width':2.5}});
   syncLayerVisibility(map);map.setPaintProperty('parcel-extrusion','fill-extrusion-opacity',opacityRef.current/100);
   const all=parcelRef.current.flatMap(p=>p.geometry?.coordinates?.[0]||[]);if(all.length){const xs=all.map(x=>x[0]),ys=all.map(x=>x[1]);map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{padding:45,duration:0,maxZoom:14.6});}map.once('idle',()=>{readyRef.current=true;setMapReady(true);});
   map.on('click','parcel-extrusion',(e:MapLayerMouseEvent)=>{const id=String(e.features?.[0]?.properties?.id||'');const p=parcelRef.current.find(row=>row.id===id);if(p){callbackRef.current?.(p);map.flyTo({center:centerOf(p),zoom:15.2,pitch:is3dRef.current?58:0,bearing:is3dRef.current?-18:0,duration:motionDuration(700)});}});
   const popup=new Popup({closeButton:false,closeOnClick:false,offset:12});map.on('mousemove','parcel-extrusion',(e:MapLayerMouseEvent)=>{const props=e.features?.[0]?.properties;if(!props)return;const content=document.createElement('div');content.className='parcel-hover-card';const title=document.createElement('b');title.textContent=String(props.id||'Parcel');const detail=document.createElement('span');detail.textContent=`${String(props.risk||'')} risk · priority ${String(props.priority_score||'')}`;content.append(title,detail);popup.setLngLat(e.lngLat).setDOMContent(content).addTo(map);map.getCanvas().style.cursor='pointer';});map.on('mouseleave','parcel-extrusion',()=>{map.getCanvas().style.cursor='';popup.remove();});
   map.on('click',(e:MapMouseEvent)=>{if(!measureRef.current)return;pointsRef.current=[...pointsRef.current,[e.lngLat.lng,e.lngLat.lat]];setMeasurePoints(pointsRef.current);const source=map.getSource('measurements') as GeoJSONSource|undefined;if(source){const coords=pointsRef.current;const features:Feature[]=[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:coords}} as Feature,...coords.map(c=>({type:'Feature',properties:{},geometry:{type:'Point',coordinates:c}} as Feature))];source.setData({type:'FeatureCollection',features} as never);}});
  });
  const resizeObserver=new ResizeObserver(()=>map.resize());resizeObserver.observe(hostRef.current);
  return()=>{window.clearTimeout(fallbackTimer);resizeObserver.disconnect();loadedRef.current=false;readyRef.current=false;if(!disposed)map.remove();mapRef.current=null;};
 },[]);

 useEffect(()=>{
   const map=mapRef.current;if(!map||!loadedRef.current)return;
   if(map.getLayer('satellite-layer')){
     map.setLayoutProperty('satellite-layer','visibility',mapStyle==='satellite'?'visible':'none');
     map.setPaintProperty('atlas-background','background-color',mapStyle==='dark'?'#1c1c1e':mapStyle==='satellite'?'#0a0f16':'#f2f2f7');
   }
 },[mapStyle]);

 useEffect(()=>{const map=mapRef.current;if(!map||!loadedRef.current)return;const source=map.getSource('parcels') as GeoJSONSource|undefined;source?.setData(parcelData as never);const ctx=map.getSource('context') as GeoJSONSource|undefined;ctx?.setData(contextData as never);map.setPaintProperty('parcel-extrusion','fill-extrusion-opacity',opacity/100);map.setPaintProperty('parcel-outline','line-dasharray',simulation?[2,2]:[1,0]);const height:unknown=mode==='RISK'?['*',['get','priority_score'],3.2]:mode==='OWNERSHIP CONFLICT'?['case',['boolean',['get','same_owner_conflict'],false],70,10]:mode==='BOUNDARY CONFLICT'?['case',['boolean',['get','boundary_overlap'],false],85,10]:mode==='ZONING'||mode==='LAND USE'?['case',['boolean',['get','zoning_conflict'],false],70,12]:mode==='APPLICATIONS'?['case',['boolean',['get','application_open'],false],65,10]:mode==='AI ALERTS'?['case',['any',['boolean',['get','area_mismatch'],false],['boolean',['get','active_dispute'],false],['boolean',['get','zoning_conflict'],false]],75,8]:['*',['get','priority_score'],2.4];map.setPaintProperty('parcel-extrusion','fill-extrusion-height',height as never);const color:unknown=mode==='NORMAL'?'#007aff':mode==='RISK'?['match',['get','risk'],'High','#ff3b30','Medium','#ff9500','#007aff']:mode==='OWNERSHIP CONFLICT'?['case',['boolean',['get','same_owner_conflict'],false],'#ff3b30','#007aff']:mode==='BOUNDARY CONFLICT'?['case',['boolean',['get','boundary_overlap'],false],'#ff3b30','#007aff']:mode==='ZONING'||mode==='LAND USE'?['case',['boolean',['get','zoning_conflict'],false],'#ff9500','#007aff']:mode==='APPLICATIONS'?['case',['boolean',['get','application_open'],false],'#ff9500','#007aff']:['case',['any',['boolean',['get','area_mismatch'],false],['boolean',['get','active_dispute'],false],['boolean',['get','zoning_conflict'],false]],'#ff3b30','#007aff'];map.setPaintProperty('parcel-extrusion','fill-extrusion-color',color as never);syncLayerVisibility(map);
 },[parcelData,contextData,opacity,mode,simulation,syncLayerVisibility]);
 useEffect(()=>{pointsRef.current=[];setMeasurePoints([]);const source=mapRef.current?.getSource('measurements') as GeoJSONSource|undefined;source?.setData(emptyCollection as never);},[measure]);
 useEffect(()=>{const map=mapRef.current;if(!map)return;const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:450;if(is3d)map.flyTo({pitch:58,bearing:-18,duration});else map.flyTo({pitch:0,bearing:0,duration});},[is3d]);
 useEffect(()=>{const previous=previousSelectedIdRef.current;previousSelectedIdRef.current=selected.id;if(previous===selected.id)return;const map=mapRef.current;if(!map||!parcels.length)return;const current=parcels.find(p=>p.id===selected.id);if(current){const focus=()=>map.flyTo({center:centerOf(current),zoom:Math.max(map.getZoom(),15.2),pitch:is3d?58:0,bearing:is3d?-18:0,duration:motionDuration(450)});if(map.isStyleLoaded())focus();else map.once('idle',focus);}},[selected.id]);
 useEffect(()=>{const map=mapRef.current;if(!map)return;let frame=0,last=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const pulse=(time:number)=>{frame=0;if(reduced||document.hidden||!document.hasFocus())return;if(time-last>500){last=time;if(map.getLayer('context-alerts'))try{map.setPaintProperty('context-alerts','circle-opacity',.68+Math.sin(time/650)*.25);}catch{}}frame=window.requestAnimationFrame(pulse);};const pause=()=>{if(frame){window.cancelAnimationFrame(frame);frame=0;}};const resume=()=>{if(!reduced&&!document.hidden&&document.hasFocus()&&!frame)frame=window.requestAnimationFrame(pulse);};const visibility=()=>document.hidden?pause():resume();window.addEventListener('blur',pause);window.addEventListener('focus',resume);document.addEventListener('visibilitychange',visibility);resume();return()=>{pause();window.removeEventListener('blur',pause);window.removeEventListener('focus',resume);document.removeEventListener('visibilitychange',visibility);};},[]);
 const measureDistance=measurePoints.length>1?distanceKm(measurePoints):0;const measureArea=measurePoints.length>2?ringAreaSqKm(measurePoints):0;
 const fitAllParcels=()=>{const map=mapRef.current;const points=parcelRef.current.flatMap(parcel=>parcel.geometry?.coordinates?.[0]||[]);if(!points.length)return;if(!mapReady){setFallbackFocus(false);setFallbackZoom(1);return;}if(!map)return;const xs=points.map(point=>point[0]),ys=points.map(point=>point[1]);map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{padding:56,maxZoom:14.6,duration:motionDuration(450)});};
 const focusSelected=()=>{const map=mapRef.current;const parcel=parcelRef.current.find(item=>item.id===selectedRef.current.id);if(!parcel?.geometry)return;if(!mapReady){setFallbackFocus(true);setFallbackZoom(1);return;}if(!map)return;const ring=parcel.geometry.coordinates[0];if(!ring?.length)return;const xs=ring.map(point=>point[0]),ys=ring.map(point=>point[1]);map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{padding:100,maxZoom:16,duration:motionDuration(450)});};
 return <div className={`map-canvas geo-map ${simulation?'simulation-map':''} ${!webgl?'map-unavailable':''}`} data-preset={preset}><div ref={hostRef} className="maplibre-container" aria-label="Interactive 3D parcel map" role="application"/>{(!webgl||!mapReady)&&<CadastralFallback parcels={parcels} selected={selected} onSelect={onSelect} zoom={fallbackZoom} focusSelected={fallbackFocus}/>}<div className="map-tools"><span className="map-badge">{simulation?'SIMULATION MODE':mapStyle==='satellite'?'GIS SATELLITE VIEW':'STANDARD ATLAS'}</span><span className="map-badge">{parcels.length} parcels</span><span className="map-badge synthetic-layer-note">Esri World Imagery + Cadastral</span></div><div className="map-utility-controls" role="group" aria-label="Map navigation">
   <div className="map-segmented-style" role="group" aria-label="Map style view switcher">
     <button type="button" className={`map-style-btn ${mapStyle==='satellite'?'active':''}`} title="GIS Real Satellite Imagery" onClick={()=>setMapStyle('satellite')}><Globe2 size={13}/><span>Satellite</span></button>
     <button type="button" className={`map-style-btn ${mapStyle==='standard'?'active':''}`} title="Standard Vector Atlas" onClick={()=>setMapStyle('standard')}><MapIcon size={13}/><span>Standard</span></button>
     <button type="button" className={`map-style-btn ${mapStyle==='dark'?'active':''}`} title="High Contrast Dark View" onClick={()=>setMapStyle('dark')}><Moon size={13}/><span>Dark</span></button>
   </div>
   <button type="button" className="map-control-icon" aria-label="Zoom in" title="Zoom in" disabled={!parcels.length} onClick={()=>{if(mapReady)mapRef.current?.zoomIn({duration:motionDuration(220)});else{setFallbackFocus(false);setFallbackZoom(value=>Math.min(3,value*1.25));}}}><Plus size={16}/></button><button type="button" className="map-control-icon" aria-label="Zoom out" title="Zoom out" disabled={!parcels.length} onClick={()=>{if(mapReady)mapRef.current?.zoomOut({duration:motionDuration(220)});else{setFallbackFocus(false);setFallbackZoom(value=>Math.max(.7,value/1.25));}}}><Minus size={16}/></button><button type="button" className="map-focus-control" title="Focus selected parcel" disabled={!selected.id||!parcels.some(parcel=>parcel.id===selected.id)} onClick={focusSelected}><LocateFixed size={15}/><span>Selected</span></button><button type="button" className="map-focus-control" title="Fit all visible parcels" disabled={!parcels.length} onClick={fitAllParcels}><span>Fit area</span></button><button type="button" className="map-view-control" aria-label={is3d?'Switch to 2D map':'Switch to 3D map'} title="Toggle 2D / 3D" disabled={!mapReady} onClick={()=>setIs3d(v=>!v)}>{is3d?<MapIcon size={15}/>:<Box size={15}/>}<span>{is3d?'3D':'2D'}</span></button><button type="button" className="map-control-icon" aria-label="Reset map orientation" title="Reset map orientation" disabled={!mapReady} onClick={()=>mapRef.current?.flyTo({bearing:0,pitch:is3d?58:0,duration:motionDuration(400)})}><Compass size={15}/></button></div>{(measureDistance>0||measureArea>0)&&<div className="map-measure-readout" aria-live="polite"><b>MEASURE</b><span>{measureDistance.toFixed(3)} km line</span>{measureArea>0&&<span>{measureArea.toFixed(4)} km² polygon</span>}<button type="button" onClick={()=>{pointsRef.current=[];setMeasurePoints([]);const src=mapRef.current?.getSource('measurements') as GeoJSONSource|undefined;src?.setData(emptyCollection as never);}}>Clear</button></div>}{mapError&&<div className="map-fallback-note" role="status">{mapError}</div>}<div className="map-coordinates">Geometry from parcel registry · {mode} analysis{simulation?' · SIMULATION':''}</div><details className="map-text-list"><summary>Parcel list · {parcels.length}</summary><div>{parcels.map(parcel=><button key={parcel.id} type="button" onClick={()=>onSelect?.(parcel)} aria-current={parcel.id===selected.id?'true':undefined}><b>{parcel.id}</b><span>{parcel.village} · {parcel.risk} risk</span></button>)}</div></details></div>;
}

