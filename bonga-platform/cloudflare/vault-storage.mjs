const allowed='private/jarvis/owner-api-key-v1';
export function vaultStorage(db){
  if(!db)return null;
  const check=key=>{if(key!==allowed)throw new Error('Invalid vault key');};
  return {
    async get(key){check(key);const row=await db.prepare('SELECT envelope FROM private_connections WHERE object_key = ?').bind(key).first();return row?{text:async()=>row.envelope}:null;},
    async put(key,envelope){check(key);if(typeof envelope!=='string'||envelope.length>8000)throw new Error('Invalid vault envelope');await db.prepare('INSERT INTO private_connections (object_key,envelope,updated_at) VALUES (?,?,?) ON CONFLICT(object_key) DO UPDATE SET envelope=excluded.envelope,updated_at=excluded.updated_at').bind(key,envelope,new Date().toISOString()).run();},
    async delete(key){check(key);await db.prepare('DELETE FROM private_connections WHERE object_key = ?').bind(key).run();}
  };
}
