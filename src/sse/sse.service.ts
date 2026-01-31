import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface SSEMessage {
  vaccinatorId: string;
  type: string;
  data: any;
}

@Injectable()
export class SSEService {
  private readonly events = new Map<string, Subject<SSEMessage>>();

  getEventStream(vaccinatorId: string): Observable<SSEMessage> {
    if (!this.events.has(vaccinatorId)) {
      this.events.set(vaccinatorId, new Subject<SSEMessage>());
    }
    return this.events.get(vaccinatorId)!.asObservable();
  }

  sendEvent(vaccinatorId: string, type: string, data: any) {
    const subject = this.events.get(vaccinatorId);
    if (subject) {
      subject.next({ vaccinatorId, type, data });
    }
  }

  removeEventStream(vaccinatorId: string) {
    const subject = this.events.get(vaccinatorId);
    if (subject) {
      subject.complete();
      this.events.delete(vaccinatorId);
    }
  }
}

