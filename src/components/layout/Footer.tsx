import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-japanese font-bold text-primary-foreground text-sm">侍</span>
            </div>
            <span className="font-bold text-lg tracking-wide">SAMURAI</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="https://www.ekanshagarwal.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Portfolio
            </a>
            <a
              href="https://github.com/ekasnh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/ekansh-agarwal01/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href="mailto:hello@ekanshagarwal.co.in"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            Made with ❤️ by{' '}
            <a
              href="https://www.ekanshagarwal.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Ekansh Agarwal
            </a>
          </p>
          <p>
            <a href="#" id="open_preferences_center" className="hover:text-foreground transition-colors">
              Update cookies preferences
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
