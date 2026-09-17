"use client";

import { useEffect, useRef, useState } from "react";

type ShareBarProps = {
  url: string;
  title: string;
};

type ShareItem = {
  label: string;
  ariaLabel: string;
  href: string;
  icon: React.ReactNode;
};

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4H16V5.3c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.2V11H9v2.8h2.4V21h2.1Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M18.9 3H21l-4.6 5.3L22 21h-4.8l-3.8-5.5L8.6 21H6.5l5-5.7L2 3h4.9l3.5 5 4.5-5Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M20.7 4.3 3.7 10.9c-1.2.5-1.2 1.1-.2 1.4l4.4 1.4 1.7 5.2c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.3 1.8-.8L23 5.9c.4-1.3-.5-1.8-1.3-1.6ZM9 13.4l9-5.7c.4-.2.7-.1.4.2l-7.3 6.6-.3 3.2L9 13.4Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M20 11.9A8 8 0 0 0 6.4 6.3a7.9 7.9 0 0 0-1.3 8.8L4 20l5-1.3a8 8 0 0 0 3 .6h.1a8 8 0 0 0 7.9-7.4Zm-8 6a6.5 6.5 0 0 1-2.8-.6l-.2-.1-3 .8.8-2.9-.2-.3a6.5 6.5 0 1 1 5.4 3.1Zm3.6-4.9c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.4.6c-.1.2-.3.2-.5.1a5.3 5.3 0 0 1-1.5-.9 5.8 5.8 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.4.2-.3c.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.3-.3-.5-.3h-.4c-.1 0-.4 0-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.1 1.5 2.3 3.7 3.2.5.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M10.6 13.4a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 0 1 1.4 1.4l-1.4 1.4a1 1 0 0 1-1.4 0Zm-1.1 4.3-1.8 1.8a2.5 2.5 0 0 1-3.5-3.5l3.4-3.4a2.5 2.5 0 0 1 3.5 0 1 1 0 0 0 1.4-1.4 4.5 4.5 0 0 0-6.3 0l-3.4 3.4a4.5 4.5 0 0 0 6.3 6.4l1.8-1.9a1 1 0 1 0-1.4-1.4Zm11.4-13.4a4.5 4.5 0 0 0-6.3 0l-1.8 1.9a1 1 0 0 0 1.4 1.4l1.8-1.8a2.5 2.5 0 0 1 3.5 3.5l-3.4 3.4a2.5 2.5 0 0 1-3.5 0 1 1 0 1 0-1.4 1.4 4.5 4.5 0 0 0 6.3 0l3.4-3.4a4.5 4.5 0 0 0 0-6.4Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M9.6 16.6 5 12l1.4-1.4 3.2 3.2 8-8L19 7.2Z" />
    </svg>
  );
}

const itemClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-rr-border bg-rr-surface text-rr-secondary transition hover:bg-rr-elevated hover:text-rr-primary";

export function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const items: ShareItem[] = [
    {
      label: "Facebook",
      ariaLabel: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookIcon />,
    },
    {
      label: "WhatsApp",
      ariaLabel: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: <WhatsAppIcon />,
    },
    {
      label: "X",
      ariaLabel: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <XIcon />,
    },
    {
      label: "Telegram",
      ariaLabel: "Share on Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <TelegramIcon />,
    },
  ];

  const handleCopy = async () => {
    let succeeded = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        succeeded = true;
      }
    } catch {
      succeeded = false;
    }

    if (!succeeded) {
      try {
        const field = document.createElement("textarea");
        field.value = url;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        succeeded = document.execCommand("copy");
        document.body.removeChild(field);
      } catch {
        succeeded = false;
      }
    }

    if (!succeeded) {
      return;
    }

    setCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-nowrap items-center justify-center gap-2">
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.22em] text-rr-muted">
        Share:
      </span>
      <div className="flex flex-nowrap items-center gap-2">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.ariaLabel}
            className={itemClassName}
          >
            {item.icon}
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Link copied" : "Copy link"}
          className={itemClassName}
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      </div>
    </div>
  );
}
