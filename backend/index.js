require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises; // Use promises version of fs for async/await
const fsSync = require('fs'); // For initial sync checks
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3001; // Use port from .env or default to 3001

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Paths
const uploadsDir = path.join(__dirname, 'uploads');
const galleryDir = path.join(uploadsDir, 'gallery');
const metadataFilePath = path.join(__dirname, 'gallery_metadata.json');
const usersFilePath = path.join(__dirname, 'users.json'); // Path for users
const teamDataFilePath = path.join(__dirname, 'team_management_data.json'); // Path for team data
const playersDataFilePath = path.join(__dirname, 'players_data.json'); // Path for players data
const teamImagesDir = path.join(uploadsDir, 'team_images'); // Path for team images
const playerImagesDir = path.join(uploadsDir, 'player_images'); // Path for player images

// Ensure directories and files exist
const ensureExists = (itemPath, isDirectory = false, defaultContent = '[]') => {
  if (!fsSync.existsSync(itemPath)) {
    if (isDirectory) {
      fsSync.mkdirSync(itemPath, { recursive: true });
    } else {
      fsSync.writeFileSync(itemPath, defaultContent, 'utf8');
    }
    console.log(`Created ${isDirectory ? 'directory' : 'file'}: ${itemPath}`);
  }
};

ensureExists(uploadsDir, true);
ensureExists(galleryDir, true);
ensureExists(metadataFilePath, false, JSON.stringify([]));
ensureExists(usersFilePath, false, JSON.stringify([]));
ensureExists(teamDataFilePath, false, JSON.stringify([])); // Ensure team data file exists
ensureExists(playersDataFilePath, false, JSON.stringify([])); // Ensure players data file exists
ensureExists(teamImagesDir, true); // Ensure team images directory exists
ensureExists(playerImagesDir, true); // Ensure player images directory exists


// --- User Data Helper Functions ---
async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    if (error.code === 'ENOENT') {
      await writeUsers([]);
      return [];
    }
    return [];
  }
}

async function writeUsers(data) {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing users file:', error);
  }
}

// --- Team Management Data Helper Functions ---
async function readTeamData() {
  try {
    const data = await fs.readFile(teamDataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading team data file:', error);
    if (error.code === 'ENOENT') {
      await writeTeamData([]);
      return [];
    }
    return [];
  }
}

async function writeTeamData(data) {
  try {
    await fs.writeFile(teamDataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing team data file:', error);
  }
}

// --- Players Data Helper Functions ---
async function readPlayersData() {
  try {
    const data = await fs.readFile(playersDataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading players data file:', error);
    if (error.code === 'ENOENT') {
      await writePlayersData([]);
      return [];
    }
    return [];
  }
}

async function writePlayersData(data) {
  try {
    await fs.writeFile(playersDataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing players data file:', error);
  }
}

// --- Metadata Helper Functions ---
// ... (keep existing readMetadata and writeMetadata functions) ...

// --- Authentication and Authorization ---

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1); // Stop the server if JWT_SECRET is not set
}

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user payload to request object
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Invalid token.' });
    }
    return res.status(500).json({ message: 'Failed to authenticate token.' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};


// --- Auth API Endpoints ---

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    let users = await readUsers();
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      role: 'user' // Default role for new registrations
    };

    users.push(newUser);
    await writeUsers(users);

    // Exclude password from the response
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = await readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});


// --- Original Metadata Helper Functions (ensure they are still here) ---
async function readMetadata() {
  try {
    const data = await fs.readFile(metadataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading metadata file:', error);
    if (error.code === 'ENOENT') { // If file doesn't exist, create it
      await writeMetadata([]);
      return [];
    }
    return []; // Return empty array on other errors to prevent crashes
  }
}

async function writeMetadata(data) {
  try {
    await fs.writeFile(metadataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing metadata file:', error);
  }
}

// --- Multer Storage Configuration for Gallery ---
const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, galleryDir);
  },
  filename: function (req, file, cb) {
    cb(null, `gallery-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});
const uploadGallery = multer({ storage: galleryStorage });

// --- Multer Storage Configuration for Team Images ---
const teamImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, teamImagesDir);
  },
  filename: function (req, file, cb) {
    cb(null, `team-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});
const uploadTeamImage = multer({ storage: teamImageStorage });

// --- Multer Storage Configuration for Player Images ---
const playerImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, playerImagesDir);
  },
  filename: function (req, file, cb) {
    cb(null, `player-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});
const uploadPlayerImage = multer({ storage: playerImageStorage });


// Serve static files from the 'uploads' directory
// This will make /uploads/gallery/*, /uploads/team_images/*, and /uploads/player_images/* accessible
app.use('/uploads', express.static(uploadsDir));

// --- API Endpoints ---

// GET root path
app.get('/', (req, res) => {
  res.send('Welcome to the Kashani Website Backend API');
});

// GET all gallery images with metadata (requires login)
app.get('/api/gallery/images', verifyToken, async (req, res) => {
  try {
    const physicalFiles = await fs.readdir(galleryDir);
    const metadata = await readMetadata();

    const imageDetails = physicalFiles
      .filter(file => /\.(jpe?g|png|gif)$/i.test(file))
      .map(filename => {
        const meta = metadata.find(m => m.filename === filename);
        return {
          src: `/uploads/gallery/${filename}`,
          filename: filename,
          caption: meta ? meta.caption : '' // Default to empty caption
        };
      });
    res.json(imageDetails);
  } catch (err) {
    console.error('Failed to list images:', err);
    res.status(500).send('Failed to retrieve images.');
  }
});

// POST (upload) a new image with an optional caption (admin only)
app.post('/api/gallery/upload', verifyToken, isAdmin, uploadGallery.single('galleryImage'), async (req, res) => {
  console.log('Upload request received. User:', req.user.username, 'Role:', req.user.role);
  console.log('Upload request received. req.file:', JSON.stringify(req.file, null, 2));
  console.log('Upload request received. req.body:', JSON.stringify(req.body, null, 2));

  if (!req.file) {
    console.error('Upload error: No file object in request.');
    return res.status(400).send('No file uploaded.');
  }

  if (!req.file.filename) {
    console.error('Upload error: req.file.filename is undefined.', req.file);
    // Attempt to delete the problematic file if it was somehow saved without a proper filename by multer
    if (req.file.path) {
      try {
        await fs.unlink(req.file.path);
        console.log('Cleaned up file with missing filename:', req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file with missing filename:', cleanupError);
      }
    }
    return res.status(500).send('File upload failed: Server error processing file name.');
  }

  const filename = req.file.filename; // Explicitly use the filename from multer
  const caption = req.body.caption || '';

  try {
    const metadata = await readMetadata();
    // Check if a file with the same name (could happen with rapid uploads or if Date.now() isn't unique enough)
    // This is a basic check; more robust would be to ensure unique filenames from multer or retry with new name
    if (metadata.some(m => m.filename === filename)) {
        console.warn(`Metadata entry for ${filename} already exists. This might be a duplicate upload or filename collision.`);
    }
    metadata.push({ filename, caption });
    await writeMetadata(metadata);

    console.log(`Successfully uploaded ${filename} with caption "${caption}"`);
    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: `/uploads/gallery/${filename}`, // Ensure this uses the confirmed filename
      filename: filename, // Ensure this is the confirmed filename
      caption: caption
    });
  } catch (error) {
    console.error(`Error saving metadata for ${filename}:`, error);
    try {
      await fs.unlink(path.join(galleryDir, filename));
      console.log(`Cleaned up ${filename} after metadata save failure.`);
    } catch (unlinkError) {
      console.error(`Error deleting ${filename} after metadata save failure:`, unlinkError);
    }
    res.status(500).send('File uploaded, but failed to save metadata.');
  }
});

// PUT (update) caption for a specific image (admin only)
app.put('/api/gallery/image/:filename/caption', verifyToken, isAdmin, async (req, res) => {
  console.log('Update caption request. User:', req.user.username, 'Role:', req.user.role);
  const { filename } = req.params;
  const { caption } = req.body;

  if (typeof caption !== 'string') {
    return res.status(400).send('Caption must be a string.');
  }

  try {
    let metadata = await readMetadata();
    const imageIndex = metadata.findIndex(m => m.filename === filename);

    if (imageIndex === -1) {
      return res.status(404).send('Image metadata not found.');
    }

    metadata[imageIndex].caption = caption;
    await writeMetadata(metadata);
    res.status(200).json({ message: 'Caption updated successfully', filename, caption });
  } catch (error) {
    console.error('Error updating caption:', error);
    res.status(500).send('Failed to update caption.');
  }
});

// DELETE a specific gallery image and its metadata (admin only)
app.delete('/api/gallery/image/:filename', verifyToken, isAdmin, async (req, res) => {
  console.log('Delete image request. User:', req.user.username, 'Role:', req.user.role);
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'Filename is required.' });
  }

  const filePath = path.join(galleryDir, filename);

  try {
    // Delete the physical file
    await fs.unlink(filePath);

    // Remove metadata entry
    let metadata = await readMetadata();
    const updatedMetadata = metadata.filter(m => m.filename !== filename);
    await writeMetadata(updatedMetadata);

    res.status(200).json({ message: 'Image and metadata deleted successfully', filename });
  } catch (err) {
    console.error(`Failed to delete ${filePath} or its metadata:`, err);
    if (err.code === 'ENOENT') { // File not found
      // Check if metadata still exists and remove it
      try {
        let metadata = await readMetadata();
        const initialLength = metadata.length;
        const updatedMetadata = metadata.filter(m => m.filename !== filename);
        if (updatedMetadata.length < initialLength) {
          await writeMetadata(updatedMetadata);
          return res.status(200).json({ message: 'Image file not found, but its metadata was removed.', filename });
        }
        return res.status(404).json({ message: 'Image file not found, and no metadata found for it.' });
      } catch (metaErr) {
        console.error('Error cleaning up metadata for non-existent file:', metaErr);
        return res.status(500).json({ message: 'Image file not found, error during metadata cleanup.' });
      }
    }
    res.status(500).json({ message: 'Failed to delete image or its metadata.' });
  }
});


// --- Team Management API Endpoints ---

// GET all team members (requires login)
app.get('/api/team', verifyToken, async (req, res) => {
  try {
    const teamData = await readTeamData();
    // Add image URLs
    const teamWithImageUrls = teamData.map(member => ({
      ...member,
      imageUrl: member.imageFilename ? `/uploads/team_images/${member.imageFilename}` : null
    }));
    res.json(teamWithImageUrls);
  } catch (error) {
    console.error('Error fetching team data:', error);
    res.status(500).json({ message: 'Failed to retrieve team data.' });
  }
});

// GET a single team member by ID (requires login)
app.get('/api/team/:id', verifyToken, async (req, res) => {
  try {
    const teamData = await readTeamData();
    const member = teamData.find(m => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found.' });
    }
    const memberWithImageUrl = {
      ...member,
      imageUrl: member.imageFilename ? `/uploads/team_images/${member.imageFilename}` : null
    };
    res.json(memberWithImageUrl);
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ message: 'Failed to retrieve team member.' });
  }
});

// POST a new team member (admin only)
app.post('/api/team', verifyToken, isAdmin, uploadTeamImage.single('teamImage'), async (req, res) => {
  try {
    const { name, role, bio, order } = req.body;
    if (!name || !role) {
      // If an image was uploaded due to failed validation, delete it
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({ message: 'Name and role are required.' });
    }

    const newMember = {
      id: uuidv4(),
      name,
      role,
      bio: bio || '',
      imageFilename: req.file ? req.file.filename : null,
      order: order ? parseInt(order, 10) : 0,
      createdAt: new Date().toISOString()
    };

    const teamData = await readTeamData();
    teamData.push(newMember);
    await writeTeamData(teamData);

    const memberResponse = {
        ...newMember,
        imageUrl: newMember.imageFilename ? `/uploads/team_images/${newMember.imageFilename}` : null
    }
    res.status(201).json({ message: 'Team member added successfully', member: memberResponse });
  } catch (error) {
    console.error('Error adding team member:', error);
    // If an image was uploaded but an error occurred later, try to delete it
    if (req.file && req.file.path) {
        try { await fs.unlink(req.file.path); } catch (e) { console.error("Error cleaning up uploaded file on failure:", e); }
    }
    res.status(500).json({ message: 'Failed to add team member.' });
  }
});

// PUT update an existing team member (admin only)
app.put('/api/team/:id', verifyToken, isAdmin, uploadTeamImage.single('teamImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio, order, removeCurrentImage } = req.body;

    let teamData = await readTeamData();
    const memberIndex = teamData.findIndex(m => m.id === id);

    if (memberIndex === -1) {
      // If an image was uploaded for a non-existent member, delete it
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(404).json({ message: 'Team member not found.' });
    }

    const existingMember = teamData[memberIndex];
    let oldImageFilename = existingMember.imageFilename; // Store old image filename

    // Update fields
    existingMember.name = name || existingMember.name;
    existingMember.role = role || existingMember.role;
    existingMember.bio = typeof bio === 'string' ? bio : existingMember.bio; // Allow empty string for bio
    existingMember.order = order ? parseInt(order, 10) : existingMember.order;
    existingMember.updatedAt = new Date().toISOString();

    let newImageUploaded = false;
    if (req.file) { // If a new image is uploaded
      existingMember.imageFilename = req.file.filename;
      newImageUploaded = true;
    } else if (removeCurrentImage === 'true' || removeCurrentImage === true) {
        existingMember.imageFilename = null; // Explicitly remove image
    }


    await writeTeamData(teamData);

    // Delete old image if a new one was uploaded OR if removeCurrentImage was true and there was an old image
    if (oldImageFilename && (newImageUploaded || ( (removeCurrentImage === 'true' || removeCurrentImage === true) && oldImageFilename !== existingMember.imageFilename) ) ) {
      try {
        await fs.unlink(path.join(teamImagesDir, oldImageFilename));
        console.log(`Deleted old team image: ${oldImageFilename}`);
      } catch (unlinkError) {
        // Log error but don't fail the whole request if old image deletion fails
        console.error(`Failed to delete old team image ${oldImageFilename}:`, unlinkError);
      }
    }
    
    const memberResponse = {
        ...existingMember,
        imageUrl: existingMember.imageFilename ? `/uploads/team_images/${existingMember.imageFilename}` : null
    }
    res.json({ message: 'Team member updated successfully', member: memberResponse });
  } catch (error) {
    console.error('Error updating team member:', error);
     // If a new image was uploaded but an error occurred later, try to delete it
    if (req.file && req.file.path) {
        try { await fs.unlink(req.file.path); } catch (e) { console.error("Error cleaning up uploaded file on update failure:", e); }
    }
    res.status(500).json({ message: 'Failed to update team member.' });
  }
});

// DELETE a team member (admin only)
app.delete('/api/team/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let teamData = await readTeamData();
    const memberIndex = teamData.findIndex(m => m.id === id);

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    const memberToDelete = teamData[memberIndex];
    const imageFilenameToDelete = memberToDelete.imageFilename;

    teamData.splice(memberIndex, 1); // Remove member from array
    await writeTeamData(teamData);

    // If member had an image, delete it from the filesystem
    if (imageFilenameToDelete) {
      try {
        await fs.unlink(path.join(teamImagesDir, imageFilenameToDelete));
        console.log(`Deleted team image: ${imageFilenameToDelete}`);
      } catch (unlinkError) {
        console.error(`Failed to delete team image ${imageFilenameToDelete}:`, unlinkError);
        // Don't fail the whole request, but log that image cleanup failed
      }
    }

    res.json({ message: 'Team member deleted successfully', id });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ message: 'Failed to delete team member.' });
  }
});


// --- Players API Endpoints ---

// GET all players (requires login)
app.get('/api/players', verifyToken, async (req, res) => {
  try {
    const playersData = await readPlayersData();
    const playersWithImageUrls = playersData.map(player => ({
      ...player,
      imageUrl: player.imageFilename ? `/uploads/player_images/${player.imageFilename}` : null
    }));
    res.json(playersWithImageUrls);
  } catch (error) {
    console.error('Error fetching players data:', error);
    res.status(500).json({ message: 'Failed to retrieve players data.' });
  }
});

// GET a single player by ID (requires login)
app.get('/api/players/:id', verifyToken, async (req, res) => {
  try {
    const playersData = await readPlayersData();
    const player = playersData.find(p => p.id === req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found.' });
    }
    const playerWithImageUrl = {
      ...player,
      imageUrl: player.imageFilename ? `/uploads/player_images/${player.imageFilename}` : null
    };
    res.json(playerWithImageUrl);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ message: 'Failed to retrieve player.' });
  }
});

// POST a new player (admin only)
app.post('/api/players', verifyToken, isAdmin, uploadPlayerImage.single('playerImage'), async (req, res) => {
  try {
    const { name, position, jerseyNumber, bio, dateOfBirth, nationality, order } = req.body;
    if (!name || !position) {
      if (req.file) await fs.unlink(req.file.path); // Clean up uploaded file if validation fails
      return res.status(400).json({ message: 'Name and position are required.' });
    }

    const newPlayer = {
      id: uuidv4(),
      name,
      position,
      jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : null,
      bio: bio || '',
      dateOfBirth: dateOfBirth || null,
      nationality: nationality || '',
      imageFilename: req.file ? req.file.filename : null,
      order: order ? parseInt(order, 10) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const playersData = await readPlayersData();
    playersData.push(newPlayer);
    await writePlayersData(playersData);
    
    const playerResponse = {
        ...newPlayer,
        imageUrl: newPlayer.imageFilename ? `/uploads/player_images/${newPlayer.imageFilename}` : null
    };
    res.status(201).json({ message: 'Player added successfully', player: playerResponse });
  } catch (error) {
    console.error('Error adding player:', error);
    if (req.file && req.file.path) { // Clean up uploaded file if error occurs after upload
        try { await fs.unlink(req.file.path); } catch (e) { console.error("Error cleaning up uploaded player image on failure:", e); }
    }
    res.status(500).json({ message: 'Failed to add player.' });
  }
});

// PUT update an existing player (admin only)
app.put('/api/players/:id', verifyToken, isAdmin, uploadPlayerImage.single('playerImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, jerseyNumber, bio, dateOfBirth, nationality, order, removeCurrentImage } = req.body;

    let playersData = await readPlayersData();
    const playerIndex = playersData.findIndex(p => p.id === id);

    if (playerIndex === -1) {
      if (req.file) await fs.unlink(req.file.path); // Clean up uploaded file if player not found
      return res.status(404).json({ message: 'Player not found.' });
    }

    const existingPlayer = playersData[playerIndex];
    let oldImageFilename = existingPlayer.imageFilename;

    // Update fields, only if provided in request body
    if (name) existingPlayer.name = name;
    if (position) existingPlayer.position = position;
    if (jerseyNumber) existingPlayer.jerseyNumber = parseInt(jerseyNumber, 10);
    if (typeof bio === 'string') existingPlayer.bio = bio;
    if (dateOfBirth) existingPlayer.dateOfBirth = dateOfBirth;
    if (typeof nationality === 'string') existingPlayer.nationality = nationality;
    if (order) existingPlayer.order = parseInt(order, 10);
    existingPlayer.updatedAt = new Date().toISOString();

    let newImageUploaded = false;
    if (req.file) { // A new image is uploaded
      existingPlayer.imageFilename = req.file.filename;
      newImageUploaded = true;
    } else if (removeCurrentImage === 'true' || removeCurrentImage === true) { // Explicit request to remove image
        existingPlayer.imageFilename = null;
    }
    // If no new image and no explicit removal, imageFilename remains unchanged.

    await writePlayersData(playersData);

    // Delete old image if a new one was uploaded OR if explicitly removed
    if (oldImageFilename && (newImageUploaded || ( (removeCurrentImage === 'true' || removeCurrentImage === true) && oldImageFilename !== existingPlayer.imageFilename) ) ) {
      try {
        await fs.unlink(path.join(playerImagesDir, oldImageFilename));
        console.log(`Deleted old player image: ${oldImageFilename}`);
      } catch (unlinkError) {
        console.error(`Failed to delete old player image ${oldImageFilename}:`, unlinkError);
      }
    }
    
    const playerResponse = {
        ...existingPlayer,
        imageUrl: existingPlayer.imageFilename ? `/uploads/player_images/${existingPlayer.imageFilename}` : null
    };
    res.json({ message: 'Player updated successfully', player: playerResponse });
  } catch (error) {
    console.error('Error updating player:', error);
    if (req.file && req.file.path) { // Clean up newly uploaded file if error occurs after upload
        try { await fs.unlink(req.file.path); } catch (e) { console.error("Error cleaning up uploaded player image on update failure:", e); }
    }
    res.status(500).json({ message: 'Failed to update player.' });
  }
});

// DELETE a player (admin only)
app.delete('/api/players/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let playersData = await readPlayersData();
    const playerIndex = playersData.findIndex(p => p.id === id);

    if (playerIndex === -1) {
      return res.status(404).json({ message: 'Player not found.' });
    }

    const playerToDelete = playersData[playerIndex];
    const imageFilenameToDelete = playerToDelete.imageFilename;

    playersData.splice(playerIndex, 1); // Remove player from array
    await writePlayersData(playersData);

    // If player had an image, delete it from the filesystem
    if (imageFilenameToDelete) {
      try {
        await fs.unlink(path.join(playerImagesDir, imageFilenameToDelete));
        console.log(`Deleted player image: ${imageFilenameToDelete}`);
      } catch (unlinkError) {
        console.error(`Failed to delete player image ${imageFilenameToDelete}:`, unlinkError);
        // Don't fail the whole request, but log that image cleanup failed
      }
    }

    res.json({ message: 'Player deleted successfully', id });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ message: 'Failed to delete player.' });
  }
});


// --- Initial Admin User Setup ---
async function initializeAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.warn('Admin username or password not set in .env file. Skipping admin user creation.');
    return;
  }

  try {
    let users = await readUsers();
    const adminUser = users.find(user => user.username === adminUsername);

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (adminUser) {
      // Update existing admin's password if it changed, and ensure role is admin
      if (!bcrypt.compareSync(adminPassword, adminUser.password) || adminUser.role !== 'admin') {
        adminUser.password = hashedPassword;
        adminUser.role = 'admin';
        console.log(`Admin user "${adminUsername}" password updated and role confirmed.`);
      } else {
        console.log(`Admin user "${adminUsername}" already configured.`);
      }
    } else {
      // Create new admin user
      users.push({
        id: uuidv4(),
        username: adminUsername,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`Admin user "${adminUsername}" created.`);
    }
    await writeUsers(users);
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}


app.listen(port, async () => {
  await initializeAdminUser(); // Initialize admin user on server start
  console.log(`Backend server listening at http://localhost:${port}`);
});