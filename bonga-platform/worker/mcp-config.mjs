import {z} from 'zod/v4';
// Configure before the SDK creates protocol schemas; Workers prohibit new Function.
z.config({jitless:true});
