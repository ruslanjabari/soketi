import { Server } from './../src/server';
import { Utils } from './utils';

jest.retryTimes(3);

describe('private channel test', () => {
    afterEach(done => {
        if (Utils.currentServer) {
            Utils.currentServer.stop().then(() => {
                Utils.currentServer = null;
                done();
            });
        }
    });

    test('connects to private channel', done => {
        Utils.newServer({}, (server: Server) => {
            let client = Utils.newClientForPrivateChannel();
            let backend = Utils.newBackend();
            let channelName = `private-${Utils.randomChannelName()}`;

            client.connection.bind('state_change', ({ current }) => {
                if (current === 'connected') {
                    let channel = client.subscribe(channelName);

                    channel.bind('greeting', e => {
                        expect(e.message).toBe('hello');
                        client.disconnect();
                        done();
                    });

                    channel.bind('pusher:subscription_succeeded', () => {
                        Utils.sendEventToChannel(backend, channelName, 'greeting', { message: 'hello' });
                    });
                }
            });
        });
    });
});
