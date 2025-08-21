"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Plus, Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api" // Your centralized API client

interface Post {
  id: string
  user_name: string
  user_role: string
  content: string
  created_at: string
  likes_count: number
  is_liked: boolean
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPosts = async () => {
  setLoading(true)
  try {
    const res = await apiClient.getCommunityPosts()
    if (!res.success || !res.data) throw new Error(res.error || "Failed to load posts")

    // Use posts array under res.data.posts
    const postsData = Array.isArray(res.data.posts) ? res.data.posts : []
    setPosts(postsData)

  } catch (error) {
    toast({
      title: "Error fetching posts",
      description: "Please login or check your server",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchPosts()
  }, [])

  const createPost = async () => {
  if (!newPost.trim()) return

  setIsPosting(true)
  try {
    const res = await apiClient.createCommunityPost({
      content: newPost,
      category: "discussion",
    })

    if (!res.success || !res.data?.post) throw new Error(res.error || "Failed to post")

    setPosts((prev) => [res.data.post, ...prev])
    setNewPost("")
    toast({
      title: "Post Created",
      description: "Your post was shared successfully!",
      className: "border-purple-200 bg-purple-50 text-purple-800",
    })
  } catch (error) {
    toast({
      title: "Failed to Post",
      description: "Try again later or check your auth",
      variant: "destructive",
    })
  } finally {
    setIsPosting(false)
  }
}


  const handleReportIncident = () => {
    window.location.href = "/report"
  }

  const handleFindVolunteers = () => {
    toast({
      title: "Finding Volunteers",
      description: "Searching for nearby volunteers...",
      className: "border-turquoise-200 bg-turquoise-50 text-turquoise-800",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold text-navy-900">Community</h1>
      <p className="text-navy-600">Share alerts, stay connected & safe together.</p>

      {/* Actions */}
      <div className="bg-white border rounded-lg p-4 shadow-md space-y-4">
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Something</DialogTitle>
              </DialogHeader>
              <Textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <Button onClick={createPost} disabled={isPosting} className="mt-3 w-full">
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
            onClick={handleReportIncident}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Incident
          </Button>

          <Button
            variant="outline"
            className="border-navy-300 text-navy-700 hover:bg-navy-50"
            onClick={handleFindVolunteers}
          >
            <Users className="h-4 w-4 mr-2" />
            Find Volunteers
          </Button>
        </div>
      </div>

      {/* Posts */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Community Posts</h2>
        {loading ? (
          <p className="text-gray-500">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Be the first to share something!</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-50 border rounded-md p-4 hover:shadow transition"
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-purple-700">{post.user_name}</span>
                  <span className="text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
                </div>
                <p className="text-gray-800">{post.content}</p>
                <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.likes_count} likes
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
