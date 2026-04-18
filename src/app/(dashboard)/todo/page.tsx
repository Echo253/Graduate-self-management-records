"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Plus, Trash2, RotateCcw, Pencil } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

type Todo = {
  id: string
  content: string
  completed: boolean
  createdAt: string
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState("")
  const [showCompleted, setShowCompleted] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editContent, setEditContent] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/todos")
      const data = await res.json()
      setTodos(data.todos)
    } catch {
      toast.error("获取数据失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addTodo = async () => {
    if (!newTodo.trim()) {
      toast.error("请输入待办事项")
      return
    }

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newTodo.trim() })
      })
      if (res.ok) {
        toast.success("已添加")
        setNewTodo("")
        fetchData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed })
      })
      if (res.ok) {
        fetchData()
      }
    } catch {
      toast.error("操作失败")
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("已删除")
        fetchData()
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const openEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setEditContent(todo.content)
  }

  const updateTodo = async () => {
    if (!editingTodo) return
    if (!editContent.trim()) {
      toast.error("内容不能为空")
      return
    }

    try {
      const res = await fetch(`/api/todos/${editingTodo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() })
      })
      if (res.ok) {
        toast.success("已更新")
        setEditingTodo(null)
        setEditContent("")
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || "更新失败")
      }
    } catch {
      toast.error("更新失败")
    }
  }

  const pendingTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">待办清单</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            添加待办
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="输入待办事项"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              className="flex-1"
            />
            <Button onClick={addTodo} className="gap-2">
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">待完成 ({pendingTodos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTodos.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无待办事项</p>
          ) : (
            <div className="space-y-2">
              {pendingTodos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className="h-6 w-6 p-0 rounded-full border-2 border-gray-300"
                  />
                  <span className="flex-1">{todo.content}</span>
                  <Button variant="ghost" size="sm" onClick={() => openEditTodo(todo)}>
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full justify-between p-0 h-auto"
          >
            <CardTitle className="text-lg">
              ✓ 已完成 ({completedTodos.length})
            </CardTitle>
            <span className="text-sm text-gray-500">
              {showCompleted ? "收起" : "展开"}
            </span>
          </Button>
        </CardHeader>
        {showCompleted && (
          <CardContent>
            {completedTodos.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无已完成事项</p>
            ) : (
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className="h-6 w-6 p-0 rounded-full bg-green-500 text-white"
                    >
                      ✓
                    </Button>
                    <span className="flex-1 line-through text-gray-500">{todo.content}</span>
                    <Button variant="ghost" size="sm" onClick={() => openEditTodo(todo)}>
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog open={!!editingTodo} onOpenChange={(open) => !open && setEditingTodo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑待办事项</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="输入待办事项内容"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateTodo()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTodo(null)}>
                取消
              </Button>
              <Button onClick={updateTodo}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
