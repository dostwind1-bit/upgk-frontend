import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { Send, Users, User as UserIcon, Plus } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [tab, setTab] = useState('dm'); // 'dm' | 'group'
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // {type, id, name}
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => setUsers(data));
    api.get('/chat/groups').then(({ data }) => setGroups(data));
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_dm', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('receive_group_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('message_blocked', ({ reason, flags }) => {
      toast.error(`${reason}${flags?.length ? ': ' + flags.join(', ') : ''}`);
    });

    return () => {
      socket.off('receive_dm');
      socket.off('receive_group_message');
      socket.off('message_blocked');
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openDm = async (targetUser) => {
    setActiveChat({ type: 'dm', id: targetUser._id, name: targetUser.name });
    const { data } = await api.get(`/chat/dm/${targetUser._id}`);
    setMessages(data);
  };

  const openGroup = async (group) => {
    setActiveChat({ type: 'group', id: group._id, name: group.name });
    socket?.emit('join_group', group._id);
    const { data } = await api.get(`/chat/groups/${group._id}/messages`);
    setMessages(data);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !socket) return;

    if (activeChat.type === 'dm') {
      socket.emit('send_dm', { toUserId: activeChat.id, content: text });
    } else {
      socket.emit('send_group_message', { groupId: activeChat.id, content: text });
    }
    setText('');
  };

  const createGroup = async () => {
    const name = prompt('Group ka naam:');
    if (!name) return;
    const { data } = await api.post('/chat/groups', { name, isPublic: true });
    setGroups([...groups, data]);
    toast.success('Group ban gaya');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-4rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-72 bg-white rounded-card border border-ink/10 flex flex-col overflow-hidden">
        <div className="flex border-b border-ink/10">
          <button onClick={() => setTab('dm')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 ${tab === 'dm' ? 'text-ink border-b-2 border-saffron' : 'text-muted'}`}>
            <UserIcon size={15} /> DM
          </button>
          <button onClick={() => setTab('group')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 ${tab === 'group' ? 'text-ink border-b-2 border-saffron' : 'text-muted'}`}>
            <Users size={15} /> Groups
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'dm' ? (
            users.map((u) => (
              <button
                key={u._id}
                onClick={() => openDm(u)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-paperDim text-left ${activeChat?.id === u._id ? 'bg-paperDim' : ''}`}
              >
                <div className="w-9 h-9 rounded-full bg-teal/20 flex items-center justify-center text-teal font-semibold">
                  {u.name[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium">{u.name}</span>
              </button>
            ))
          ) : (
            <>
              <button onClick={createGroup} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-teal font-medium hover:bg-paperDim">
                <Plus size={16} /> Naya group banao
              </button>
              {groups.map((g) => (
                <button
                  key={g._id}
                  onClick={() => openGroup(g)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-paperDim text-left ${activeChat?.id === g._id ? 'bg-paperDim' : ''}`}
                >
                  <div className="w-9 h-9 rounded-full bg-saffron/30 flex items-center justify-center text-marigold font-semibold">
                    {g.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{g.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-card border border-ink/10 flex flex-col overflow-hidden">
        {activeChat ? (
          <>
            <div className="px-5 py-3 border-b border-ink/10 flex items-center gap-2">
              <h3 className="font-display font-medium text-ink">{activeChat.name}</h3>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-teal' : 'bg-muted'}`} />
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {messages.map((m, i) => {
                const mine = m.sender?._id === user._id || m.sender === user._id;
                return (
                  <div key={m._id || i} className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-ink text-paper self-end rounded-br-sm' : 'bg-paperDim text-charcoal self-start rounded-bl-sm'}`}>
                    {!mine && <p className="text-xs font-semibold text-teal mb-0.5">{m.sender?.name}</p>}
                    {m.content}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-ink/10">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message likho..."
                className="flex-1 border border-ink/20 rounded-full px-4 py-2 outline-none focus:border-teal"
              />
              <button type="submit" className="bg-saffron text-ink p-2.5 rounded-full">
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            Chat shuru karne ke liye left se koi contact ya group chuno
          </div>
        )}
      </div>
    </div>
  );
}
