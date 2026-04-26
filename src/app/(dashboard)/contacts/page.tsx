import React from "react";
import { Users } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const contactData = [
  {
    id: "1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    avatar: "https://github.com/shadcn.png",
    status: "Completed",
    lastContacted: "17-Oct-2024",
    duration: "1hr"
  },
  {
    id: "2",
    name: "John Doe",
    email: "johndoe@gmail.com",
    avatar: "https://github.com/shadcn.png",
    status: "In a Session",
    lastContacted: "17-Oct-2024",
    duration: "24hr"
  },
  {
    id: "3",
    name: "John Doe",
    email: "johndoe@gmail.com",
    avatar: "https://github.com/shadcn.png",
    status: "Incomplete",
    lastContacted: "17-Oct-2024",
    duration: ">1hr"
  },
  {
    id: "4",
    name: "John Doe",
    email: "johndoe@gmail.com",
    avatar: "https://github.com/shadcn.png",
    status: "Completed",
    lastContacted: "17-Oct-2024",
    duration: "9hr"
  },
  {
    id: "5",
    name: "John Doe",
    email: "johndoe@gmail.com",
    avatar: "https://github.com/shadcn.png",
    status: "Completed",
    lastContacted: "17-Oct-2024",
    duration: "10hr"
  }
];

export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Contacts</h1>
      </div>
      
      <div className="bg-[#121215] border border-white/5 rounded-[2rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[50px] p-6">
                <Checkbox className="border-white/20 data-[state=checked]:bg-primary" />
              </TableHead>
              <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider p-6">Avatar</TableHead>
              <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider p-6">Name</TableHead>
              <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider p-6">Email</TableHead>
              <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider p-6">Status</TableHead>
              <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider p-6">Last Contacted</TableHead>
              <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider p-6">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactData.map((contact) => (
              <TableRow key={contact.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="p-6">
                  <Checkbox className="border-white/20 data-[state=checked]:bg-primary" />
                </TableCell>
                <TableCell className="p-6">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="p-6 text-zinc-300 font-semibold">{contact.name}</TableCell>
                <TableCell className="p-6 text-zinc-500 font-medium">{contact.email}</TableCell>
                <TableCell className="p-6">
                  <Badge 
                    variant="outline" 
                    className={`rounded-xl px-4 py-1.5 border-white/10 font-bold text-[10px] ${
                      contact.status === "Completed" ? "bg-primary/5 text-primary border-primary/20" :
                      contact.status === "In a Session" ? "bg-indigo-500/5 text-indigo-500 border-indigo-500/20" :
                      "bg-zinc-500/5 text-zinc-500 border-zinc-500/20"
                    }`}
                  >
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell className="p-6 text-zinc-500 font-medium">{contact.lastContacted}</TableCell>
                <TableCell className="p-6 text-zinc-500 font-medium">{contact.duration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

