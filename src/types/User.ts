export interface User {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    group_id: string;
    created_at?: string;
  }


  export interface body {
    createdAt: any;
    name: string;
    created_at?: string;
  }


 export interface Profile {
  username:string
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  userId: string;
  password:string

}

  