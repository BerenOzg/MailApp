import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Message } from "../models/message.model";

const baseUrl = 'http://localhost:8080/api/messages'

@Injectable({
    providedIn: 'root'
})

export class MessageService {

    constructor(private http: HttpClient) { }

    get(id: any): Observable<Message> {
        return this.http.get<Message>(`${baseUrl}/${id}`);
    }

    getInbox(condition: any): Observable<any> {
        let params = new HttpParams();
        Object.entries(condition).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    params = params.append(key, v);
                });
            } else if (value instanceof Date) {
                params = params.set(key, value.toISOString());
            } else {
                params = params.set(key, String(value));
            }
        });

        return this.http.get<Message[]>(`${baseUrl}/inbox`, { params });
    }
    
    getOutbox(condition: any): Observable<any> {
        let params = new HttpParams();
        Object.entries(condition).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    params = params.append(key, v);
                });
            } else if (value instanceof Date) {
                params = params.set(key, value.toISOString());
            } else {
                params = params.set(key, String(value));
            }
        });
        return this.http.get<Message[]>(`${baseUrl}/outbox`, { params });
    }

    getAll(condition: any): Observable<any> {
        let params = new HttpParams();
        Object.entries(condition).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    params = params.append(key, v); // for repeated query params like to=user1&to=user2
                });
            } else if (value instanceof Date) {
                params = params.set(key, value.toISOString());
            } else {
                params = params.set(key, String(value));
            }
        });
        return this.http.get<any>(`${baseUrl}/all`, { params });
    }

    create(data: any): Observable<any> {
        return this.http.post(`${baseUrl}/send`, data);
    }
    
    update(id: any, data: any): Observable<any> {
        return this.http.put(`${baseUrl}/${id}`, data);
    }
}
