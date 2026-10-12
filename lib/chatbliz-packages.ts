// Chatbliz tenant package catalog. Proposed prices; no payment or entitlement enforcement yet.
export const packageCatalog = [
 {id:'starter',name:'Starter',monthlyZar:199,features:['Business profile','Brand asset library','Website and store briefs','AI assistant task board'],studioCredits:0},
 {id:'growth',name:'Growth',monthlyZar:499,features:['Starter features','Marketing and sales plans','Content briefs','Tenant workspace'],studioCredits:5},
 {id:'partner',name:'Business Partner',monthlyZar:999,features:['Growth features','Negotiation and coaching workflows','Priority planning','App and store launch checklists'],studioCredits:15}
] as const;
export const addonCatalog = [
 {id:'studio_image',name:'Studio image production',unit:'per image',proposedZar:49,requiresProvider:true},
 {id:'studio_video',name:'Studio video production',unit:'per video',proposedZar:199,requiresProvider:true},
 {id:'podcast',name:'Podcast studio',unit:'per session',proposedZar:299,requiresProvider:true},
 {id:'livestream',name:'Livestream studio',unit:'per session',proposedZar:399,requiresProvider:true},
 {id:'extra_assistant',name:'Additional AI assistant workflows',unit:'per month',proposedZar:99,requiresProvider:true}
] as const;
