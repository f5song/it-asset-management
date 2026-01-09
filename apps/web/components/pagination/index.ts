
// src/pagination/index.ts
import { ListService } from './listService';

// คุณสามารถเปลี่ยน baseUrl เป็น ENV ของคุณได้ เช่น process.env.NEXT_PUBLIC_API_BASE
export const listService = new ListService({ baseUrl: '' });
