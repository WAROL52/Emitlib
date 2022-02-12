
class Emitlib{
    #registry={}
    #Event=class HEvent{
        constructor({eventType,eventName,func}){
            const desc={
                writable:false,
                configurable:false,
                enumerable:false
            }
            Object.defineProperties(this,{
                eventName:{
                    ...desc,
                    value:eventName
                },
                eventType:{
                    ...desc,
                    value:eventType
                },
                func:{
                    ...desc,
                    value:func
                },
                eventKey:{
                    ...desc,
                    value:`${eventType}-${eventName}-${parseInt(Math.random()*10**10)}`
                },
            })
        }
    }
    useModeStrict=false
    typesValid=[]
    data={}
    onBeforeAllEvent=undefined
    onBeforeEachEvent=undefined
    onAfterAllEvent=undefined
    onAfterEachEvent=undefined
    constructor(option={
        useModeStrict:false,
        typesValid:[123],
        onBeforeAllEvent:undefined,
        onBeforeEachEvent:undefined,
        onAfterAllEvent:undefined,
        onAfterEachEvent:undefined,
        data:{}
    }){
        
        const s={
            writable:false,
            configurable:false,
            enumerable:false
        }
        Object.assign(this,option)
        Object.defineProperties(this,{
            useModeStrict:{
                ...s,
                value:option.useModeStrict||false
            },
            typesValid:{
                ...s,
                value:option.typesValid||[]
            },
            onBeforeAllEvent:{
                ...s,
                value:option.onBeforeAllEvent
            },
            onBeforeEachEvent:{
                ...s,
                value:option.onBeforeEachEvent
            },
            onAfterAllEvent:{
                ...s,
                value:option.onAfterAllEvent
            },
            onAfterEachEvent:{
                ...s,
                value:option.onAfterEachEvent
            },
            data:{
                ...s,
                value:option.data
            },
        })
        if(!Array.isArray(option.typesValid)){
            if(option.useModeStrict){
                const message=` [useModeStrict=true]  the typesValid must be a type Array<String> and not empty`
                console.warn(message);
                throw message
            }
        }
        Object.seal(this)
    }
    createEvent(eventType,eventName,eventOption={
        onBeforeAllEvent:undefined,
        onBeforeEachEvent:undefined,
        onAfterAllEvent:undefined,
        onAfterEachEvent:undefined,
        eventState:{}
    }){
        if(this.useModeStrict){
            if (!this.typesValid.includes(eventType)) {
                const message=`[useModeStrict=true] eventType:'${eventType}' is not include in list typesValid:'[${this.typesValid}]'`
                console.warn(message);
                throw message
            }
        }
        if(this.#registry[eventType]?.[eventName]){
            const message=`this event is already created in the registry`
            console.warn(message);
            throw message
        }
        if(!this.#registry[eventType])this.#registry[eventType]={}
        const eventKey=`create-${eventType}-${eventName}-${parseInt(Math.random()*10**10)}`
        this.#registry[eventType][eventName]={
            ...eventOption,
            eventKey,
            eventList:[]
        }
        return eventKey
    }
    on(eventType,eventName,func){
        if(this.useModeStrict){
            if (!this.#registry[eventType]) {
                const message=`[useModeStrict=true] you must first create this event before using this method in strict mode`
                console.warn(message);
                throw message
            }
            if (!this.typesValid.includes(eventType)) {
                const message=`[useModeStrict=true] the eventType:'${eventType}' is not included in typesValid:[${this.typesValid}]`
                console.warn(message);
                throw message
            }
        }
        if(!this.#registry[eventType])this.#registry[eventType]={}

        const ev=new this.#Event({eventType,eventName,func})

        if(this.#registry[eventType]?.[eventName]){
            this.#registry[eventType]?.[eventName].eventList.push(ev)
            return ev.eventKey
        }

        this.#registry[eventType][eventName]={eventList:[ev],eventKey:`on-${eventType}-${eventName}-${parseInt(Math.random()*10**10)}`}
        return ev.eventKey
    }
    emit(eventType,eventName,emitOption={}){
        const obEv=this.#registry[eventType]?.[eventName]
        if(!obEv) return
        const option={
            data:this.data,
            eventstate:obEv.eventState
        }
        this?.onBeforeAllEvent?.(obEv.eventList,emitOption,option)
        obEv?.onBeforeAllEvent?.(obEv.eventList,emitOption,option)
        obEv.eventList.forEach(ev=>{
            this?.onBeforeEachEvent?.(ev,emitOption,option)
            obEv?.onBeforeEachEvent?.(ev,emitOption,option)
            ev?.func?.(ev,emitOption,option)
            obEv?.onAfterEachEvent?.(ev,emitOption,option)
            this?.onAfterEachEvent?.(ev,emitOption,option)
        })
        obEv?.onAfterAllEvent?.(obEv.eventList,emitOption,option)
        this?.onAfterAllEvent?.(obEv.eventList,emitOption,option)
        return emitOption
    }
    removeEvent(eventType,eventName,eventKey){
        const Oev=this.#registry[eventType]?.[eventName]
        if(!Oev)return false
        const toDeleting=()=>{
            delete this.#registry[eventType]?.[eventName]
            if(!Object.entries(this.#registry[eventType])) delete this.#registry[eventType]
            return true
        }
        if(Oev.eventKey==eventKey){
            return toDeleting()
        }
        const index=Oev.eventList.findIndex(ev=>ev.eventKey==eventKey)
        if(index!=-1){
            Oev.eventList.splice(index,1)
            if(!this.#registry?.[eventType]?.[eventName]?.eventList) return toDeleting()
            return true
        }
        return false
    }
    getEvent(eventType,eventName){
        return this.#registry?.[eventType]?.[eventName]?.eventList
    }
}
const ev=new Emitlib({
    useModeStrict:true,
    typesValid:['nom']
})

console.log(ev);
ev.nom="Rolio"
console.log(ev);
ev.createEvent('nom','Rolio',{
    onBeforeAllEvent(){
        console.log('onBeforeAllEvent');
    },
    onBeforeEachEvent(){
        console.log('onBeforeEachEvent');
    },
    onAfterAllEvent(){
        console.log('onAfterAllEvent');
    },
    onAfterEachEvent(){
        console.log('onAfterEachEvent');
    },
    eventState:{
        nom:'Rabe',
        prenom:'Rolio'
    }
})
ev.on('nom','Rolio',(ev,dataEmit,option)=>{
    console.log('ev1',ev);
})
const key=ev.on('nom','Rolio',(ev,dataEmit,option)=>{
    console.log('ev2',ev);
})
console.log(ev.removeEvent('nom','Rolio',key));