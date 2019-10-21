import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  public mensajes: OSNotificationPayload[] = [
    //{
    //  title: 'titulo de la push',
    //  body: 'este es el body de la push',
    //  date: new Date()
    //}
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal, private storage: Storage) {
    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }


  configuracionInicial() {
    this.oneSignal.startInit('4c6992af-7de1-408d-89b3-7f8542dd6ba0', '157462610550');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
      // do something when notification is received
      console.log('Notificacion recibidas', noti);
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
      // do something when a notification is opened
      console.log('Notificacion Abierta', noti);
      await this.notificacionRecibida(noti.notification);
    });

    //Obtener id del subscritor
    this.oneSignal.getIds().then(info => {
      this.userId = info.userId;
      console.log(this.userId);
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification) {
    await this.cargarMensajes();

    const payload = noti.payload;

    const existePush = this.mensajes.find(mensaje => mensaje.notificationID === payload.notificationID);

    if (existePush) {
      return;
    }

    this.mensajes.unshift(payload);//se inserta en el arreglo de mensajes

    this.pushListener.emit(payload);

    await this.guardarMensajes();
  }

  guardarMensajes() {
    this.storage.set('mensajesPush', this.mensajes);
  }

  async cargarMensajes() {
    this.mensajes = await this.storage.get('mensajesPush') || [];
    return this.mensajes;
  }

  async borrarMensajes() {
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }


}
