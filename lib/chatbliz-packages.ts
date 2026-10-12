// Chatbliz Business Partner subscription configuration — prices specified by product owner.
// Payment collection, usage metering and entitlement enforcement must be connected separately.
export const packageCatalog = [
 {id:'starter',name:'Adviser',monthlyZar:299,profileLimit:1,teamMultiplier:1,studioCredits:0,
  team:['Sales Assistant','Legal Information Assistant','Mentor','Business Adviser'],
  features:['One business profile','One Business Partner dashboard','My Brand to Website/App to Studio workflow planning','Tasks and reminders dashboard','Sales assistant','Legal information guidance (not legal representation)','Mentor and adviser team']},
 {id:'growth',name:'Coach & Executive',monthlyZar:499,profileLimit:2,teamMultiplier:2,studioCredits:0,
  team:['Sales Assistant','Legal Information Assistant','Mentor','Business Adviser','Business Coach','Executive Assistant'],
  features:['Everything in Adviser','Two business profiles','Double assistant capacity','Business coach','Executive support team','Workflow scheduling and operations monitoring']},
 {id:'partner',name:'Studio Partner',monthlyZar:899,profileLimit:8,teamMultiplier:4,studioCredits:10,
  team:['Sales Assistant','Legal Information Assistant','Mentor','Business Adviser','Business Coach','Executive Assistant','Studio Assistant'],
  features:['Everything in Coach & Executive','Eight business profiles','Double Growth assistant capacity','Studio access with 10 monthly usage credits (provisional)','Brand story and media production workflow']}
] as const;
export const addonCatalog = [
 {id:'studio_image',name:'Studio image production',unit:'per image',proposedZar:49,requiresProvider:true},
 {id:'studio_video',name:'Studio video production',unit:'per video',proposedZar:199,requiresProvider:true},
 {id:'podcast',name:'Podcast studio',unit:'per session',proposedZar:299,requiresProvider:true},
 {id:'livestream',name:'Livestream studio',unit:'per session',proposedZar:399,requiresProvider:true},
 {id:'extra_assistant',name:'Additional AI assistant workflows',unit:'per month',proposedZar:99,requiresProvider:true}
] as const;
