import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../models/user.model";

const baseUrl = 'http://localhost:8080/api/test';

@Injectable({
    providedIn: 'root'
})

export class UserService {
    constructor(private http: HttpClient) { }

    get(id: any): Observable<User> {
        return this.http.get<User>(`${baseUrl}/${id}`);
    }

    getAll(conditions: any = {}): Observable<any> {
        let params = new HttpParams();
        Object.entries(conditions).forEach(([key, value]) => {
            if(value instanceof Date) {
                params = params.set(key, value.toISOString());
            } else {
                params = params.set(key, String(value));
            }
        });
        return this.http.get<any>(`${baseUrl}/all`, { params });
    }

    create(data: User): Observable<User> {
        return this.http.post<User>(`${baseUrl}/add`, data);
    }

    update(id: any, data: User): Observable<User> {
        return this.http.put<User>(`${baseUrl}/${id}`, data);
    }

    delete(id: any): Observable<any> {
        return this.http.delete(`${baseUrl}/delete/${id}`);
    }
}