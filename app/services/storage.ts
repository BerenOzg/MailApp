import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const USER_KEY = 'auth-user';
const API_URL = 'http://localhost:8080/api/test';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  clean(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.sessionStorage.clear();
    }
  }

  public saveUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      window.sessionStorage.removeItem(USER_KEY);
      window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  public getUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = window.sessionStorage.getItem(USER_KEY);
      if (user) {
        return JSON.parse(user);
      }
    }
    return {};
  }

  public isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const user = window.sessionStorage.getItem(USER_KEY);
      if (user) {
        return true;
      }
    }
    return false;
  }

  public refreshUserData(): Observable<any> {
    const currentUser = this.getUser();
    if (!currentUser || !currentUser.id) {
      return of(null);
    }

    return this.http.get(`${API_URL}/${currentUser.id}`).pipe(
      map((updatedUser: any) => {
        // Merge the updated data with existing session data (preserve accessToken)
        const refreshedUser = {
          ...currentUser,
          username: updatedUser.username,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin
        };
        this.saveUser(refreshedUser);
        return refreshedUser;
      }),
      catchError(error => {
        console.error('Error refreshing user data:', error);
        return of(currentUser); // Return current data if refresh fails
      })
    );
  }

  public updateUserData(updates: any): void {
    const currentUser = this.getUser();
    if (currentUser && currentUser.id) {
      const updatedUser = { ...currentUser, ...updates };
      this.saveUser(updatedUser);
    }
  }
}