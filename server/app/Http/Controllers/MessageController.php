<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index(Group $group, Request $request)
    {
        if (!$group->isMember(auth()->user())) {
            return response()->json(['message' => 'No tienes acceso a este grupo'], 403);
        }

        $messages = $group->messages()
            ->with('sender:_id,name,department')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function store(Request $request, Group $group)
    {
        if (!$group->isMember(auth()->user())) {
            return response()->json(['message' => 'No tienes acceso a este grupo'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required_without:file|string',
            'file' => 'nullable|file|max:10240', // 10MB max
            'parent_id' => 'nullable|exists:messages,_id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $messageData = [
            'group_id' => $group->_id,
            'sender_id' => auth()->id(),
            'content' => $request->content,
            'type' => 'text',
            'parent_id' => $request->parent_id
        ];

        // Manejar archivo adjunto si existe
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('group-files', 'public');
            
            $messageData['type'] = $this->getFileType($file);
            $messageData['file_url'] = Storage::url($path);
            $messageData['file_name'] = $file->getClientOriginalName();
            $messageData['file_size'] = $file->getSize();
        }

        $message = Message::create($messageData);
        $message->load('sender:_id,name,department');

        // Emitir evento de mensaje enviado
        event(new MessageSent($message));

        return response()->json($message, 201);
    }

    public function update(Request $request, Group $group, Message $message)
    {
        if ($message->sender_id !== auth()->id()) {
            return response()->json(['message' => 'No puedes editar este mensaje'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message->update([
            'content' => $request->content,
            'is_edited' => true
        ]);

        return response()->json($message);
    }

    public function destroy(Group $group, Message $message)
    {
        if ($message->sender_id !== auth()->id() && !$group->isAdmin(auth()->user())) {
            return response()->json(['message' => 'No puedes eliminar este mensaje'], 403);
        }

        // Eliminar archivo si existe
        if ($message->file_url) {
            Storage::delete(str_replace('/storage/', 'public/', $message->file_url));
        }

        $message->delete();

        return response()->json(['message' => 'Mensaje eliminado exitosamente']);
    }

    private function getFileType($file)
    {
        $mime = $file->getMimeType();
        if (strpos($mime, 'image/') === 0) {
            return 'image';
        }
        return 'file';
    }
}