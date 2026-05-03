import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from './app/interceptor/interceptor';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
