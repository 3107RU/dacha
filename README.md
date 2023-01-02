Dacha Architecture:

1. Stream
	1. Get id from command line
	2. Read config from db.
 	3. Receive rtsp stream.
	4. Write stream on disk as files with length = max([key_frame, key_frame), 10 sec) limit 100 files in circle, write time to db.

2. Camera
	1. Get id from command line
	2. Read config from db.
 	3. Manage 1 or 2 (high, low) streams.
	4. Control ptz using onvif.
	5. Recive onvif events, write desc and time to db.

3. Analyzer
	1. Read config from db.
 	2. Search db for new files decode and analyze for human or vehicle movement and write events.

4. Archiver
	1. Read config from db.
 	2. Search db for new files, copy them to archive.
 	3. Erase old records in archive.

5. Commander
	1. Read config from db.
 	2. Search db for new events, decides what to do (send to client, telegram, rotate camera, switch light on, etc.)

6. Server
	1. Read config from db.
	2. Manage users, disks, cameras, analyzer, archiver, commander.
	3. Http api for client.

7. Client
	1. Settings view
	2. Archive view
	3. Live view


TODO:

Step 1:
	1. Server find ip cameras by ws-discovery
	2. Client show camera list, snapshot, streams
Step 2:
	1. Client select camera and streams
	2. Server write config and create camera processes
Step 3:
	1. Camera write onvif events
	2. Server create commander process
Step 4:
	1. Commander reads events and files
	2. Client receives events as list
