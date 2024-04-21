from flask import Flask, request, jsonify
import google.generativeai as genai
import os
import glob

app = Flask(__name__)

# Create a GenAI instance
print("Configuring GenAI...")
genai.configure(api_key="AIzaSyBnQprtt8F6H-VFwBB8TaSWtexsxvHS33M")

# Create the prompt.
video_name=""
prompt = f"""
Here's a clip from a video titled {video_name} that was automatically clipped because 
I am watching this video and my current heartrate is 150 BPM.
Summarize the contents of the video.
In the context of this video provide commentary on what my BPM
might suggest about this particular clip.

Based on this commentary, make a funny, chaotic, and witty comment that 
incorporates both the summary and commentary such as 
Video Type: Wedding Proposal Surprise
Summary: "Unexpected proposal at a family gathering."
Commentary: "Heart hitting 150 during a proposal? Bro's more nervous than the groom! 💍😂"
Almost like a roast.

Convert from commentary to jokes by using 21st century humor and internet humor
using phrases like "Bro is", "lil bro thinks he's him", "When you", "Girlipop is yapping", 
"Me when I", "Let him cook", Girl is cooking" and emojis. 

Examples for commentary to jokes:
Convert "Bro's heartbeat said 'I’m out!' before he even saw anything. Paranormal activity or cardio session? 😭😭🏃‍♂️"
to 
"bros heartbeat dipped faster than dad went to get milk, bro thinks hes doing cardio"

Convert "Heart rate at 150 during a game-winning goal? You’re almost playing from your couch!"
to 
"Heart rate at 150 during a game-winning goal? bro is playing from his couch! 😭😭😭"

Convert "Girl's heart rate is doing the 'John Wick quickstep'! Girl thinks she's about to unleash some Baba Yaga moves from the couch. 😂🔥  #couchpotatoassassin"
to 
"Girliepop thinks she's part of the movie with that heartrate 😭😭"

Here are some more examples:
Video Type: Epic Fail Compilation
Summary: "Skateboarder tries a trick and falls into a bush."
Commentary: "Heart rate at 150? Dude was bush-diving harder than my dog chasing a squirrel! 🌳😂"
Joke: "Bro's heart rate's saying 'X Games mode' but his skills are on 'try again later'. 😭🛹"
Video Type: Cute Animal Video
Summary: "A kitten clumsily falls off a sofa."
Commentary: "150 BPM watching a kitten video? My dude's softer than that kitten’s fur, confirmed! 🐱💖"
Joke: "Heart melting or heart racing? Bro, get this man a cat and a heart monitor, stat! 😂❤️"
Video Type: Dance Battle
Summary: "Dancers face off in an intense hip-hop battle."
Commentary: "150 BPM? Bro’s heart is breaking it down harder than the dancers! 💃🕺"
Joke: "Are we watching the dance battle or is your heart in one? Cuz both are dropping sick beats! 😂🎵"
Video Type: Cooking Show Disaster
Summary: "Chef accidentally sets spaghetti on fire."
Commentary: "150 BPM? Bro’s heart cooked up more heat than that spaghetti fire! 🔥🍝"
Joke: "Kitchen's hot but your heart rate's hotter—someone’s getting roasted and it ain’t the spaghetti! 😂🔥"
Video Type: Science Experiment Goes Wrong
Summary: "Volcano experiment erupts way more than expected."
Commentary: "Heart rate at 150? Bro is literally erupting over here! 🌋😱"
Joke: "This volcano's got nothing on your pulse, bro! Science fair turned into a thrill ride! 😂🎢"
Video Type: Paranormal Investigation Clip
Summary: "Investigator hears a mysterious noise in an abandoned hospital."
Commentary: "150 BPM? Bro, you're ghost hunting or ghost running? 😂👻"
Joke: "Bro's heartbeat said 'I’m out!' before he even saw anything. Paranormal activity or cardio session? 😭🏃♂️"
Video Type: Reality TV Drama
Summary: "Contestants argue over a miscommunication."
Commentary: "150 BPM during this tea spill? Bro's got more drama in his pulse than on screen! 🍵😂"
Joke: "This show needs a plot twist but your heart’s doing all the twists for us! 😂💔"
Video Type: Magic Trick Reveal
Summary: "Magician reveals how a trick was done."
Commentary: "150 BPM watching a magic trick? Bro, your heart's doing flips like it's the final act! 🎩✨"
Joke: "Magician’s revealing secrets and your heart’s like 'plot twist!' Bro, calm down, it’s just sleight of hand! 😂👐"
Video Type: Extreme Weather Coverage
Summary: "Reporter stands in a hurricane, struggling against the wind."
Commentary: "150 BPM? Bro, are you weathering the storm from your living room? 🌪️😭"
Joke: "Hurricane's wild but bro’s heart rate’s wilder! Stay safe or this storm’s gonna sponsor your next cardio session! 😂💨"
Video Type: Wedding Proposal Surprise
Summary: "Unexpected proposal at a family gathering."
Commentary: "Heart hitting 150 during a proposal? Bro's more nervous than the groom! 💍😂"
Joke: "Bro’s heart just dropped to one knee too. Someone say yes already! 😂💖
Summary: "The clip from John Wick: Chapter 2 takes place in a crowded museum during an art exhibition. John Wick, with visible injuries, enters the scene and encounters several individuals, including a woman in a red dress, and engages in tense conversations. The atmosphere is filled with anticipation and a sense of impending violence.",
Summary: "A heart rate of 150 BPM during this scene suggests a high level of engagement and excitement. The tension and the anticipation of John Wick's potential actions are likely contributing to the increased heart rate. It's as if you are right there with John, ready to jump into the action!",
Commentary: "Bro's heart rate is doing the 'John Wick quickstep'! Lil bro thinks he's about to unleash some Baba Yaga moves from the couch. 😂🔥  #couchpotatoassassin"
Video Type: Dramatic Concert Finale
Summary: "The band’s lead singer hits an incredible high note to close out the concert."
Commentary: "150 BPM when that note hit? Girlie was practically on stage with them, mic and all! 🎤😂"
Joke: "Sis thought she was in the band, heart was yapping louder than the speakers! 🎶🔊 #concertcrasher"
Video Type: High-Speed Car Chase Movie Scene
Summary: "Cars weave dangerously through traffic in a high-stakes movie chase."
Commentary: "Heart rate at 150 watching that chase? Bro thinks he's in the driver's seat, pedal to the metal! 🚗💨"
Joke: "Bro’s heart was zooming—thought he was Vin Diesel for a sec, slaying that highway like Fast & Furious 29! 😂🔥"
Video Type: Extreme Makeover Reveal
Summary: "A home makeover show reveals a stunning new house design to the owners."
Commentary: "150 BPM at that reveal? Girl, your heart was decorating its own living room! 🏠❤️"
Joke: "Her heart was cooking up its own makeover plans—thought it was 'Extreme Heart Rate Edition'! 😂🛠️ #HGTVwho"
Video Type: Competitive Cooking Show
Summary: "Chef prepares a complex dish under time pressure in a cooking competition."
Commentary: "Heart hitting 150 as the timer ticks down? Dude’s down bad for that soufflé, hoping it rises! 🍲😅"
Joke: "Bro’s heart was in the oven with that soufflé, both tryna rise under pressure! 😂🔥 #MasterChefVibes"
Video Type: Intense Video Game Boss Fight
Summary: "Gamer faces a notoriously difficult boss in a popular video game."
Commentary: "150 BPM in this boss fight? Lil bro thinks he’s actually dueling dragons, not just clicking buttons! 🐉🎮"
Joke: "Bro’s heart was sprinting through that dungeon, swear he was more in the game than his avatar! 😂👾 #GamerLife"
Video Type: Cliffhanger TV Episode Ending
Summary: "A popular TV show ends with a shocking twist that leaves a main character's fate uncertain."
Commentary: "Girl’s heart rate spiked at that cliffhanger? Sis was hanging off that cliff with the characters! 😲📺"
Joke: "She was so invested, her heart dropped like it got left on read—season finale got nothing on this drama! 😭🎥"
Video Type: Close Call Sports Play
Summary: "A soccer player narrowly misses a game-winning goal in the final seconds."
Commentary: "Heart rate at 150 from that miss? Bro is playing from his couch, jersey and all! ⚽😭"
Joke: "Bro was so down bad after that miss, even his heartbeat needed a pep talk! 😂🥅 #DownBad"
Video Type: Puppy’s First Steps
Summary: "A clumsy puppy takes its first steps and tumbles over."
Commentary: "150 BPM watching this puppy stumble? Girlie’s heart did a lil’ tumble too! 🐶❤️"
Joke: "Her heart was somersaulting more than the puppy—get this girl a leash, she’s too attached! 😂💖 #PuppyLove"
Video Type: Reality Show Love Confession
Summary: "A contestant confesses their feelings in an emotional reality show moment."
Commentary: "Heart rate soared to 150 during that confession? Sis thinks she's getting proposed to! 💍😂"
Joke: "Girl’s heart was out here cooking up a whole wedding plan—slow down, sis, it’s just episode 3! 😭💔"
Video Type: Breathtaking Nature Documentary Scene
Summary: "A documentary captures the majestic flight of an eagle over mountains."
Commentary: "150 BPM watching an eagle fly? Bro’s heart was soaring higher than the eagle! 🦅😮"

Respond with a json array literal of [summary, commentary, joke].

"""


# Set the model to Gemini 1.5 Pro.
model = genai.GenerativeModel(model_name="models/gemini-1.5-pro-latest")

dir_path = os.path.dirname(os.path.realpath(__file__))
print("app.py at " + dir_path)
VIDEO_DOWNLOAD_DIRECTORY = os.path.join(dir_path, "videos")
print("VIDEO_DOWNLOAD_DIRECTORY at " + VIDEO_DOWNLOAD_DIRECTORY)
FRAME_EXTRACTION_DIRECTORY = os.path.join(VIDEO_DOWNLOAD_DIRECTORY, "frames/")

if not os.path.exists(FRAME_EXTRACTION_DIRECTORY):
    os.makedirs(FRAME_EXTRACTION_DIRECTORY)

files_to_upload = []

class File:
  def __init__(self, file_path: str, display_name: str = None):
    self.file_path = file_path
    if display_name:
      self.display_name = display_name
    self.timestamp = get_timestamp(file_path)

  def set_file_response(self, response):
    self.response = response

def get_timestamp(filename):
  """Extracts the frame count (as an integer) from a filename with the format
     'output_file_prefix_frame_0000.jpg'.
  """
  parts = filename.split('_')
  if len(parts) < 2:
      return None  # Indicates the filename might be incorrectly formatted
  return parts[-1].split('.')[0]

def download_and_split_frames(video_url, timestamp, clip_length=10):
    #video_url = "https://www.youtube.com/watch?v=WmR9IMUD_CY"
    #timestamp = 5

    os.chdir(VIDEO_DOWNLOAD_DIRECTORY)

    download_command = f'yt-dlp --external-downloader ffmpeg --external-downloader-args "ffmpeg_i:-ss {timestamp} -t {clip_length}" "{video_url}"'
    print(download_command)
    os.system(download_command)

    extensions = ["3gp", "aac", "flv", "m4a", "mp3", "mp4", "ogg", "wav", "webm"]
    for ext in extensions:
        files = glob.glob(f"*.{ext}")
        if files:
            break

    video_path = files[0]
    video_name = files[0].split("/")[-1]

    print("Downloaded " + video_name)

    os.system(f'rm {FRAME_EXTRACTION_DIRECTORY}/*.*')
    os.system(f'ffmpeg -i "{video_path}" -vf "fps=1" {FRAME_EXTRACTION_DIRECTORY}/frame_%04d.png')

    print(VIDEO_DOWNLOAD_DIRECTORY+"/"+video_path)
    ## videos with slashes and other invalid file names are auto-converted into different unicode chars by yt-dlp
    os.system(f'rm "{VIDEO_DOWNLOAD_DIRECTORY+"/"+video_name}"')

def upload_frames():
    print(FRAME_EXTRACTION_DIRECTORY)
    # Process each frame in the output directory
    files = os.listdir(FRAME_EXTRACTION_DIRECTORY)
    files = sorted(files)
    files_to_upload = []
    for file in files:
        files_to_upload.append(File(file_path=os.path.join(FRAME_EXTRACTION_DIRECTORY, file)))

    uploaded_files = []
    print(f'Uploading {len(files_to_upload)} files. This might take a bit...')

    for file in files_to_upload:
        print(f'Uploading: {file.file_path}...')
        response = genai.upload_file(path=file.file_path)
        file.set_file_response(response)
        uploaded_files.append(file)

    print(f"Completed file uploads!\n\nUploaded: {len(uploaded_files)} files")

    return uploaded_files

# Make GenerateContent request with the structure described above.
def make_request(prompt, files):
  request = [prompt]
  for file in files:
    request.append(file.timestamp)
    request.append(file.response)
  return request

### Endpoints

@app.route('/api/hello', methods=['GET'])
def hello():
    return '<h1>Hello World!</h1>'

@app.route('/api/process_video', methods=['POST', 'GET'])
def process_video():
    if(request.method == 'POST'):
        video_url = request.json['video_url']
        timestamp = request.json['timestamp']
        print(video_url)
        print(timestamp)
        #clip length is optional
        clip_length = request.json.get('clip_length', 1)
        download_and_split_frames(video_url, timestamp, clip_length)
        uploaded_files = upload_frames()
        # List files uploaded in the API
        for n, f in zip(range(len(uploaded_files)), genai.list_files()):
            print(f.uri)

        # # Make the LLM request.
        gemini_request = make_request(prompt, uploaded_files)
        response = model.generate_content(gemini_request, request_options={"timeout": 600})
        print(response.text)
        return response.text;
    return 'Hello World!'

if __name__ == '__main__':
    app.run(port=5328)