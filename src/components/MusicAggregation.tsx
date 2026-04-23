"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import PageHero from "@/components/PageHero";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Video, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// ------------------ Schema ------------------
const formSchema = z.object({
  name: z.string().min(2),
  stageName: z.string().min(2),
  idNumber: z.string().min(6),
  phone: z.string().min(10),
  email: z.string().email(),
  category: z.string().min(1),
  portfolio: z.string().optional(),
  description: z.string().min(10),
});

type FormValues = z.infer<typeof formSchema>;

const MAX_VIDEO_DURATION_SECONDS = 60;
const MAX_VIDEO_SIZE_MB = 50;

type VideoState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "ready"; file: File; previewUrl: string; duration: number }
  | { status: "error"; message: string };

export default function ContentAggregation() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [video, setVideo] = useState<VideoState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      stageName: "",
      idNumber: "",
      phone: "",
      email: "",
      category: "Film & Production",
      portfolio: "",
      description: "",
    },
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };

  // ── Video validation ──────────────────────────────────────
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear input so re-selecting same file triggers change
    e.target.value = "";

    // Size check (client-side fast reject)
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setVideo({ status: "error", message: `Video must be under ${MAX_VIDEO_SIZE_MB} MB.` });
      return;
    }

    if (!file.type.startsWith("video/")) {
      setVideo({ status: "error", message: "Please select a valid video file." });
      return;
    }

    setVideo({ status: "validating" });

    // Duration check via a hidden <video> element
    const url = URL.createObjectURL(file);
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.src = url;

    videoEl.onloadedmetadata = () => {
      const duration = videoEl.duration;
      URL.revokeObjectURL(url); // clean up old URL

      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        setVideo({
          status: "error",
          message: `Video is ${Math.round(duration)}s — maximum allowed is ${MAX_VIDEO_DURATION_SECONDS}s (1 minute).`,
        });
        return;
      }

      // Create a fresh preview URL to keep
      const previewUrl = URL.createObjectURL(file);
      setVideo({ status: "ready", file, previewUrl, duration: Math.round(duration) });
    };

    videoEl.onerror = () => {
      URL.revokeObjectURL(url);
      setVideo({ status: "error", message: "Could not read video file. Please try another." });
    };
  };

  const clearVideo = () => {
    if (video.status === "ready") URL.revokeObjectURL(video.previewUrl);
    setVideo({ status: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ────────────────────────────────────────────────
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSubmitting(true);

    try {
      const formData = new FormData();

      // Text fields
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== "") formData.append(key, val as string);
      });

      // Video (optional)
      if (video.status === "ready") {
        formData.append("video", video.file);
        formData.append("videoDuration", String(video.duration));
      }

      const res = await fetch("/api/creator", {
        method: "POST",
        body: formData, // no Content-Type header — browser sets multipart boundary
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send");

      setSubmitted(true);
      form.reset();
      clearVideo();

      toast({
        title: "Application Sent!",
        description: "We'll contact you shortly.",
      });
    } catch (err: any) {
      toast({
        title: "Error sending application",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        title="Turn Your Content Into Capital"
        description="Monetize, license, and distribute your content globally through Ludeva's creator ecosystem."
        imageSrc="/images/hero-creator.png"
      />

      <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <Container>

          {/* INTRO */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              A New Era for Creators
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ludeva provides a structured ecosystem where creators can transform
              their content into financial assets through licensing, acquisition,
              and global distribution.
            </p>
          </motion.div>

          {/* ONBOARDING */}
          <div className="mt-24 grid md:grid-cols-2 gap-10">
            {[
              {
                title: "Creator Onboarding",
                content: [
                  "Download contract from Documents section",
                  "Fill in professional credentials",
                  "Attach portfolio of work",
                  "Specify content categories",
                  "Submit to creator@ludevaplc.co.ke",
                ],
              },
              {
                title: "Acquisition & Licensing",
                content: [
                  "Submit content proposals or catalogues",
                  "Evaluation by editorial & investment teams",
                  "Assessment of quality and market potential",
                  "Licensing or buyout agreements",
                  "Immediate capital + global distribution",
                ],
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                whileHover={{ scale: 1.04 }}
                className="p-8 rounded-2xl bg-white dark:bg-gray-900 border shadow-sm hover:shadow-xl transition"
              >
                <h3 className="text-xl font-bold mb-4 text-primary">{item.title}</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  {item.content.map((c, idx) => (
                    <li key={idx}>• {c}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* CATEGORIES */}
          <div className="mt-32 relative">
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Content Categories & Specifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
                Structured content verticals designed for scalable acquisition, licensing,
                and global distribution.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
              className="grid md:grid-cols-2 gap-8"
            >
              {[
                {
                  icon: "🎬",
                  title: "Film & Production",
                  items: ["Professional music videos", "Documentary content", "Branded content", "Cinematic short films"],
                },
                {
                  icon: "🎵",
                  title: "Music & Performance",
                  items: ["Music video productions", "Spoken word", "Live sessions", "Artist showcases"],
                },
                {
                  icon: "💃",
                  title: "Dance & Movement",
                  items: ["Choreography tutorials", "Dance challenges", "Performances", "Training content"],
                },
                {
                  icon: "🏋️",
                  title: "Fitness & Sports",
                  items: ["Gym programs", "Sports content", "Coaching videos", "Athlete content"],
                },
              ].map((cat, i) => (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/40 via-transparent to-purple-500/40"
                >
                  <div className="h-full rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-6 shadow-md group-hover:shadow-2xl transition">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white text-lg shadow-lg group-hover:scale-110 transition">
                        {cat.icon}
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{cat.title}</h4>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-4" />
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      {cat.items.map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <span className="text-primary">•</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* FORM + CONTACT */}
          <div className="mt-28 grid lg:grid-cols-2 gap-10 items-start">

            {/* LEFT: FORM */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" className="w-full">
              <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 shadow-xl backdrop-blur">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Apply as a Creator
                </h3>

                {!submitted ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                      {/* Name + Stage Name */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="stageName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stage Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. DJ Flame" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* ID + Phone */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="idNumber" render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                              <Input placeholder="National ID / Passport" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+254 700 000000" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* Email */}
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" className="h-11 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Category */}
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Film & Production">Film & Production</SelectItem>
                              <SelectItem value="Music & Performance">Music & Performance</SelectItem>
                              <SelectItem value="Dance & Movement">Dance & Movement</SelectItem>
                              <SelectItem value="Fitness & Sports">Fitness & Sports</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Portfolio */}
                      <FormField control={form.control} name="portfolio" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio / Links</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourportfolio.com" className="h-11 rounded-xl" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />

                      {/* Description */}
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Your Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your content, audience, and style..."
                              className="rounded-xl min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* ── VIDEO UPLOAD ── */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                          Sample Video{" "}
                          <span className="text-xs text-muted-foreground font-normal">
                            (optional · max 1 min · max {MAX_VIDEO_SIZE_MB} MB)
                          </span>
                        </label>

                        {/* Drop zone — hidden when a video is ready */}
                        {video.status !== "ready" && (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors
                              ${video.status === "error"
                                ? "border-red-400 bg-red-50 dark:bg-red-950/20"
                                : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
                              }`}
                          >
                            {video.status === "validating" ? (
                              <>
                                <Loader2 className="w-7 h-7 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground">Checking video…</p>
                              </>
                            ) : video.status === "error" ? (
                              <>
                                <AlertCircle className="w-7 h-7 text-red-500" />
                                <p className="text-sm text-red-600 dark:text-red-400 text-center">{video.message}</p>
                                <p className="text-xs text-muted-foreground">Click to try again</p>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Video className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Click to attach a sample video
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  MP4, MOV, WebM · up to 1 minute · max {MAX_VIDEO_SIZE_MB} MB
                                </p>
                              </>
                            )}
                          </div>
                        )}

                        {/* Preview — shown when video is ready */}
                        {video.status === "ready" && (
                          <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 overflow-hidden">
                            <video
                              src={video.previewUrl}
                              controls
                              className="w-full max-h-48 object-contain bg-black"
                            />
                            <div className="flex items-center justify-between px-4 py-2">
                              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{video.file.name}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  · {video.duration}s · {(video.file.size / 1024 / 1024).toFixed(1)} MB
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={clearVideo}
                                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-400 hover:text-red-500 transition-colors"
                                title="Remove video"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm,video/*"
                          onChange={handleVideoChange}
                          className="hidden"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting || video.status === "validating"}
                        className="w-full h-11 rounded-xl text-base"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Application…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Submit Application
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="text-center p-6 bg-green-100 dark:bg-green-900 rounded-xl">
                    ✅ Application submitted successfully!
                  </div>
                )}
              </div>
            </motion.div>

            {/* RIGHT: DETAILS PANEL */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-white to-transparent dark:from-primary/20 dark:via-gray-900 border dark:border-gray-800 shadow-xl h-full">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Get in Touch</h3>

                <div className="space-y-4 mb-8">
                  <p className="text-gray-600 dark:text-gray-300">Head of Creative Department</p>
                  <p className="text-lg font-semibold text-primary">📞 0745977710</p>
                  <p className="text-lg font-semibold text-primary break-all">✉️ creator@ludevaplc.co.ke</p>
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Onboarding Process</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                    <li>• Download and fill the creator contract</li>
                    <li>• Provide professional credentials</li>
                    <li>• Submit your portfolio & categories</li>
                    <li>• Attach a 1-minute sample video (optional)</li>
                    <li>• Send to creator@ludevaplc.co.ke</li>
                  </ul>
                </div>

                <div className="mt-10 p-5 rounded-2xl bg-white/70 dark:bg-gray-800 border dark:border-gray-700 shadow-sm">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    💡 Approved creators gain access to licensing deals, upfront capital,
                    and global distribution opportunities through Ludeva's marketplace.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>
    </>
  );
}
