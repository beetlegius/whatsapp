import { Component, OnInit } from '@angular/core'
import { NavController, PopoverController, ModalController } from 'ionic-angular'
import * as Moment from 'moment'
import { MeteorObservable } from 'meteor-rxjs'
import { Observable, Subscriber } from 'rxjs'
import { Chats, Messages, Users } from '../../../../imports/collections'
import { Chat, Message, MessageType } from '../../../../imports/models'
import { ChatsOptionsComponent } from '../chats/chats-options'
import { NewChatComponent } from '../chats/new-chat'
import { MessagesPage } from '../messages/messages'
import template from './chats.html'

@Component({
  template
})
export class ChatsPage implements OnInit {
  chats
  senderId: string

  constructor(private navCtrl: NavController, private popoverCtrl: PopoverController, private modalCtrl: ModalController) {
    this.senderId = Meteor.userId()
  }

  ngOnInit() {
    this.chats = this.findChats()
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, { cssClass: 'options-popover chats-options-popover' })

    popover.present()
  }

  showMessages(chat): void {
    this.navCtrl.push(MessagesPage, { chat })
  }

  removeChat(chat: Chat): void {
    Chats.remove({ id: chat._id }).subscribe(() => {
      // nothing to do
    })
  }

  addChat(): void {
    const modal = this.modalCtrl.create(NewChatComponent)
    modal.present()
  }

  findChats(): Observable<Chat[]> {
    // Find chats and transform them
    return Chats.find({ memberIds: { $in: [this.senderId] }}).map(chats => {
      chats.forEach(chat => {
        chat.title = ''
        chat.picture = ''

        const receiverId = chat.memberIds.find(memberId => memberId !== this.senderId)
        const receiver = Users.findOne(receiverId)

        if (receiver) {
          chat.title = receiver.profile.name
          chat.picture = receiver.profile.picture
        }

        // This will make the last message reactive
        this.findLastChatMessage(chat._id).subscribe((message) => {
          chat.lastMessage = message
        })
      })

      return chats
    })
  }

  findLastChatMessage(chatId: string): Observable<Message> {
    return Observable.create((observer: Subscriber<Message>) => {
      const chatExists = () => !!Chats.findOne(chatId)

      // Re-compute until chat is removed
      MeteorObservable.autorun().takeWhile(chatExists).subscribe(() => {
        Messages.find({ chatId }, { sort: { createdAt: -1 } }).subscribe({
          next: (messages) => {
            // Invoke subscription with the last message found
            if (!messages.length) return

            const lastMessage = messages[0]
            observer.next(lastMessage)
          },
          error: (e: Error) => {
            observer.error(e)
          },
          complete: () => {
            observer.complete()
          }
        })
      })
    })
  }

}
