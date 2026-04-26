import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#09090b]">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90 text-sm',
            card: 'bg-zinc-900 border border-white/5 rounded-2xl',
            headerTitle: 'text-white font-heading',
            headerSubtitle: 'text-zinc-400',
            socialButtonsBlockButton: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all',
            socialButtonsBlockButtonText: 'text-white',
            dividerLine: 'bg-white/10',
            dividerText: 'text-zinc-500',
            formFieldLabel: 'text-zinc-400',
            formFieldInput: 'bg-[#121215] border border-white/5 text-white',
            footerActionText: 'text-zinc-400',
            footerActionLink: 'text-primary hover:text-primary/80',
          }
        }}
      />
    </div>
  );
}
