import os
import sys
import urllib, io
os.getcwd()
sys.path.append("..")
sys.path.append("../../stimuli/block_utils")

from os import listdir
from os.path import isfile, join

import numpy as np
import scipy.stats as stats
import pandas as pd
from random import random

import pymongo as pm
from collections import Counter
import json
import re
import ast

from PIL import Image, ImageOps, ImageDraw, ImageFont 

from io import BytesIO
import base64

import  matplotlib
from matplotlib import pylab, mlab, pyplot
from matplotlib.path import Path
import matplotlib.patches as patches
from IPython.core.pylabtools import figsize, getfigs
plt = pyplot
import matplotlib as mpl
mpl.rcParams['pdf.fonttype'] = 42

import seaborn as sns
sns.set_context('talk')
sns.set_style('darkgrid')

from IPython.display import clear_output

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message="numpy.dtype size changed")
warnings.filterwarnings("ignore", message="numpy.ufunc size changed")

import blockworld_helpers as utils

###################### RENDER PATCHES IN MATPLOTLIB #######################
###########################################################################    

def get_patch(verts,
              color='orange',
              line_width = 2):
    '''
    input:
        verts: array or list of (x,y) vertices of convex polygon. 
                last vertex = first vertex, so len(verts) is num_vertices + 1
        color: facecolor
        line_width: edge width    
    output:
        patch matplotlib.path patch object
    '''
    codes = [1] + [2]*(len(verts)-1)    ## 1 = MOVETO, 2 = LINETO
    path = Path(verts,codes)
    patch = patches.PathPatch(path, facecolor=color, lw=line_width)
    return patch

def get_block_patches(blocks, color='#29335C'):
    patches = []
    for (b) in blocks:
        patches.append(get_patch(b,color=color))
    return patches

def get_block_patches_colored(blocks, colors):
    patches = []
    for i, b in enumerate(blocks):
        patches.append(get_patch(b,color=colors[i]))
    return patches

def get_patches_stim(blocks):
    patches = []
    for (b) in blocks:
        patches.append(get_patch(b.verts,color=b.base_block.color))
    return patches


# convert vertices to correct format
def compress_vertices(vert_dict, world_size = 900):
    '''
    '''
    vert_list = list(map(lambda block: list(map(lambda corner: (corner['x'],world_size-corner['y']), block)), vert_dict))
    return vert_list
    

###################### RENDER ENVIRONMENT OF BLOCKS #######################
###########################################################################   

def render_blockworld(patches,
                      xlim=(0,900),
                      ylim=(0,900),
                      figsize=(4,4)):   
    '''
    input: 
        patches: list of patches generated by get_patch() function
        xlim, ylim: axis limits
        figsize: defaults to square aspect ratio
    output:
        visualization of block placement
    '''
    fig = plt.figure(figsize=figsize)
    ax = fig.add_subplot(111)
    for patch in patches:
        ax.add_patch(patch)
    ax.set_xlim(xlim)
    ax.set_ylim(ylim) 
    cur_axes = plt.gca()
    cur_axes.axes.get_xaxis().set_visible(False)
    cur_axes.axes.get_yaxis().set_visible(False)        
    #plt.show()
    return fig

def draw_stim(world, world_size=12):
    fig = render_blockworld(get_patches_stim(world.blocks),
                            xlim=(-2,10),
                            ylim=(-2,10)) 
    return fig


# Draw final structure for a participant
def draw_final_structure(df, gameID, target_name, world_size=900):
    '''
    Render solution given dataframe, gameID, and target Name
    '''
    vert_dict = df.loc[(df.gameID == gameID) & (df.targetName == target_name),'allVertices'].apply(ast.literal_eval).values[0]
    vertices = compress_vertices(vert_dict)
    
    #score = df.loc[(df.gameID == gameID) & (df.targetName == target_name),'normedScore'].values[0]
    condition = df.loc[(df.gameID == gameID) & (df.targetName == target_name),'condition'].values[0]
    c='#29335C'
    if condition == 'physical':
        c = '#33BBBB'
    patches = get_block_patches(vertices, color=c)
    
    score = df.loc[(df.gameID == gameID) & (df.targetName == target_name),'normedScore'].values[0]
    
    fig = render_blockworld(patches,
                        xlim=(0,world_size),
                        ylim=(0,world_size)) 
    
    fig.suptitle(str(np.round(score,3)))
    
    return fig
    

############## RENDER ENVIRONMENT OF BLOCKS IN SUBPLOT ####################
###########################################################################   

    
def render_blockworld_subplot(patches,
                              ax,
                              xlim=(0,900),
                              ylim=(0,900),
                              figsize=(4,4)
                            ):   
    '''
    input: 
        patches: list of patches generated by get_patch() function
        xlim, ylim: axis limits
        figsize: defaults to square aspect ratio
    output:
        visualization of block placement
    '''
    for patch in patches:
        ax.add_patch(patch)
    ax.set_xlim(xlim)
    ax.set_ylim(ylim) 
    cur_axes = plt.gca()
    cur_axes.axes.get_xaxis().set_visible(False)
    cur_axes.axes.get_yaxis().set_visible(False)
    return ax

def draw_final_structure_subplot(df, gameID, target_name, ax, world_size=900):
    vert_dict = df.loc[(df.gameID == gameID) & (df.targetName == target_name),'allVertices'].apply(ast.literal_eval).values[0]
    vertices = compress_vertices(vert_dict)
    condition = df.loc[(df.gameID == gameID) & (df.targetName == target_name),'condition'].values[0]
    c='#29335C'
    if condition == 'physical':
        c = '#33BBBB'
    patches = get_block_patches(vertices, color=c)
    return render_blockworld_subplot(patches,
                                        ax,
                                        xlim=(0,world_size),
                                        ylim=(0,world_size))

    
# draw all final structure for all participants
def draw_all_final_structures(df, figsize=(40, 80)):
    ppts = df.gameID.unique()
    ppts.sort()
    
    target_names = df.targetName.unique()
    #target_names = [f.split('.')[0] for f in listdir(stim_dir) if isfile(join(stim_dir, f))]    
    target_names.sort()

    fig = plt.figure(figsize=figsize)
    columns = len(target_names)
    rows = len(ppts)
    k = 0
    for i in range(0,len(ppts)):
        gameID = ppts[i]
        for j in range(0,len(target_names)):
            target_name = target_names[j]
            k += 1
            ax = fig.add_subplot(rows, columns, k)
            ax = draw_final_structure_subplot(df, gameID, target_name, ax)
    plt.show()
    
def draw_all_final_structures_and_explores(df, dfe, figsize=(40, 160)):
    ppts = df.gameID.unique()
    ppts.sort()
    
    target_names = df.targetName.unique()
    #target_names = [f.split('.')[0] for f in listdir(stim_dir) if isfile(join(stim_dir, f))]    
    target_names.sort()

    fig = plt.figure(figsize=figsize)
    columns = len(target_names)
    rows = len(ppts)*2
    k = 0
    for i in range(0,len(ppts)):
        gameID = ppts[i]
        # draw end of explore phase
        for j in range(0,len(target_names)):
            target_name = target_names[j]
            k += 1
            ax = fig.add_subplot(rows, columns, k)
            ax = draw_final_structure_subplot(dfe, gameID, target_name, ax)
        # draw build phase
        for j in range(0,len(target_names)):
            target_name = target_names[j]
            k += 1
            score = df.loc[(df.gameID == gameID) & (df.targetName == target_name),'normedScore'].values[0]
            ax = fig.add_subplot(rows, columns, k)
            ax = draw_final_structure_subplot(df, gameID, target_name, ax)
            ax.set_title(str(np.round(score,3)))
    plt.show()
    return



# draw all final structure for all participants
def draw_all_trials(df, numTrials = 24, figsize=(40, 80)):
    ppts = df.gameID.unique()
    ppts.sort()
    
    trials = range(0, numTrials)
    
#     target_names = df.targetName.unique()
#     #target_names = [f.split('.')[0] for f in listdir(stim_dir) if isfile(join(stim_dir, f))]    
#     target_names.sort()

    fig = plt.figure(figsize=figsize)
    n = len(ppts)
    k = 0
    
    for j in range(0, numTrials):
        for i in range(0,n):
            gameID = ppts[i]
            k += 1
            ax = fig.add_subplot(numTrials, n, k)
            ax = draw_trial_subplot(df, gameID, j, ax)
    plt.show()
    return

def draw_trial_subplot(df, gameID, trialNum, ax, world_size=900):
    vert_dict = df.loc[(df.gameID == gameID) & (df.trialNum == trialNum),'allVertices'].apply(ast.literal_eval).values[0]
    vertices = compress_vertices(vert_dict)
    
    condition = df.loc[(df.gameID == gameID) & (df.trialNum == trialNum),'condition'].values[0]
    phase = df.loc[(df.gameID == gameID) & (df.trialNum == trialNum),'phase'].values[0]
    c=df.loc[(df.gameID == gameID) & (df.trialNum == trialNum),'blockColor'].values[0]
    
    patches = get_block_patches(vertices, color=c)
    return render_blockworld_subplot(patches,
                                        ax,
                                        xlim=(0,world_size),
                                        ylim=(0,world_size))

def draw_reconstruction_subplot(df, gameID, targetName, ax, world_size=900, cmap = 'YlGnBu', n_colors = 0):
    vert_dict = df.loc[(df.gameID == gameID) & (df.targetName == targetName),'allVertices'].apply(ast.literal_eval).values[0]
    vertices = compress_vertices(vert_dict)
    
    condition = df.loc[(df.gameID == gameID) & (df.targetName == targetName),'condition'].values[0]
    phase = df.loc[(df.gameID == gameID) & (df.targetName == targetName),'phase'].values[0]
    
    cmap=plt.get_cmap(cmap)
    n_blocks = df[(df.gameID == gameID) & (df.targetName == targetName)]['numBlocks'].values[0]
    
    colors = ['#000000' for i in range(n_blocks)]
    
    if n_colors == 0:
        n_colors = n_blocks

    cmap_vals = np.linspace(0, 1, n_colors)
    colors[0:n_colors] = [cmap(x) for x in cmap_vals]
    
    patches = get_block_patches_colored(vertices, colors=colors)
    return render_blockworld_subplot(patches,
                                        ax,
                                        xlim=(0,world_size),
                                        ylim=(0,world_size))


def draw_from_actions_subplot(df, ax, world_size = [18,13], cmap = 'YlGnBu'):
    values = np.linspace(0.2, 1, len(df))

    world = np.zeros([world_size[0],world_size[1]])

    c = 0
    for _, block in df.iterrows():
        for i in range(block.x, block.x+block.w):
            for j in range(block.y, block.y+block.h):
                world[i,j] = values[c]
        c += 1

    world = np.rot90(world)

    # show grid
    for i in range(0,world_size[0]):
        ax.axvline(x=i-0.5, ymin=0, ymax=world_size[1], color='white', linewidth=1,alpha = 0.4)

    for j in range(0,world_size[1]):
        ax.axhline(y=j-0.5, xmin=0, xmax=world_size[0], color='white', linewidth=1, alpha = 0.4)

    # show world
    ax.axis('off')
    ax.imshow(world, cmap = cmap)

    
def draw_stim_from_json(stim_name, stim_dir):
    J = open(join(stim_dir,stim_name + '.json')).read()
    w = utils.World()
    w.populate_from_json(J)
    fig=plt.figure(figsize=(20, 20))
    draw_stim(w)
    plt.title(stim_name)
    plt.show()
