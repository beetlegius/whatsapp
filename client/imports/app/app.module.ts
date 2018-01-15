import { NgModule, ErrorHandler } from '@angular/core'
import { HttpClientModule, HttpClient } from '@angular/common/http'
import { MomentModule } from 'angular2-moment'
import { BrowserModule } from '@angular/platform-browser'
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular'
import { MyApp } from './app.component'
import { ChatsPage } from '../pages/chats/chats'
import { ChatsOptionsComponent } from '../pages/chats/chats-options'
import { NewChatComponent } from '../pages/chats/new-chat'
import { MessagesPage } from '../pages/messages/messages'
import { LoginPage } from '../pages/login/login'
import { VerificationPage } from '../pages/verification/verification'
import { ProfilePage } from '../pages/profile/profile'
import { PhoneService } from '../services/phone'

@NgModule({
  declarations: [
    MyApp,
    ChatsPage,
    MessagesPage,
    LoginPage,
    VerificationPage,
    ProfilePage,
    ChatsOptionsComponent,
    NewChatComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ChatsPage,
    MessagesPage,
    LoginPage,
    VerificationPage,
    ProfilePage,
    ChatsOptionsComponent,
    NewChatComponent
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    PhoneService
  ]
})
export class AppModule {}
