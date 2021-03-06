import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core'
import { NavParams } from 'ionic-angular'
import { Messages } from '../../../../imports/collections'
import { Chat, Message, MessageType } from '../../../../imports/models'
import { MeteorObservable } from 'meteor-rxjs'
import { _ } from 'meteor/underscore'
import * as Moment from 'moment'
import { Observable } from 'rxjs'
import template from './messages.html'

@Component({
  template
})
export class MessagesPage implements OnInit, OnDestroy {
  selectedChat: Chat
  messages: Observable<Message[]>
  title: string
  picture: string
  message: string = ''
  autoScroller: MutationObserver
  scrollOffset = 0
  messagesDayGroups
  senderId: string

  constructor(navParams: NavParams, private el: ElementRef) {
    this.selectedChat = <Chat>navParams.get('chat')

    this.title = this.selectedChat.title
    this.picture = this.selectedChat.picture
    this.senderId = Meteor.userId()
  }

  private get messagesPageContent(): Element {
    return this.el.nativeElement.querySelector('.messages-page-content')
  }

  private get messagesList(): Element {
    return this.messagesPageContent.querySelector('.messages')
  }

  private get scroller(): Element {
    return this.messagesList.querySelector('.scroll-content')
  }

  ngOnInit() {
    this.autoScroller = this.autoScroll()
    this.subscribeMessages()
  }

  ngOnDestroy() {
    this.autoScroller.disconnect()
  }

  subscribeMessages() {
    this.scrollOffset = this.scroller.scrollHeight
    this.messagesDayGroups = this.findMessagesDayGroups()
  }

  findMessagesDayGroups() {
    let isEven = false

    return Messages.find(
      { chatId: this.selectedChat._id },
      { sort: { createdAt: 1 } }
    ).map((messages: Message[]) => {
      const format = 'D MMMM Y'

      // Compose missing data that we would like to show in the view
      messages.forEach((message: Message) => {
        message.ownership = this.senderId === message.senderId ? 'mine' : 'other'
        isEven = !isEven

        return message
      })

      // Group by creation day
      const groupedMessages = _.groupBy(messages, (message: Message) => {
        return Moment(message.createdAt).format(format)
      })

      // Transform dictionary into an array since Angular's view engine doesn't know how to iterate through it
      return Object.keys(groupedMessages).map((timestamp: string) => {
        return {
          timestamp: timestamp,
          messages: groupedMessages[timestamp],
          today: Moment().format(format) === timestamp
        }
      })
    })
  }

  autoScroll(): MutationObserver {
    const autoScroller = new MutationObserver(this.scrollDown.bind(this))

    autoScroller.observe(this.messagesList, {
      childList: true,
      subtree: true
    })

    return autoScroller
  }

  scrollDown(): void {
    // Scroll down and apply specified offset
    this.scroller.scrollTop = this.scroller.scrollHeight - this.scrollOffset
    // Zero offset for next invocation
    this.scrollOffset = 0
  }

  onInputKeypress({ keyCode }: KeyboardEvent): void {
    if (keyCode === 13) {
      this.sendTextMessage()
    }
  }

  sendTextMessage(): void {
    if (!this.message) return

    MeteorObservable.call('addMessage', MessageType.TEXT, this.selectedChat._id, this.message)
      .zone().subscribe(() => {
        this.message = ''
      })
  }

}
